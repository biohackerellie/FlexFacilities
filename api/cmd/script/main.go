package main

import (
	"api/internal/config"
	repository "api/internal/db"
	"api/internal/lib/logger"
	"api/internal/models"
	"context"
	"flag"
	"log/slog"
	"os"
	"slices"

	"github.com/jmoiron/sqlx"
	"github.com/stripe/stripe-go/v83"
	"golang.org/x/sync/errgroup"

	"github.com/stripe/stripe-go/v83/product"

	"github.com/stripe/stripe-go/v83/price"

	"github.com/joho/godotenv"
)

type categoryID int64

var priceGroups = [][]int64{
	{0, 0, 2500, 5000},     // (0, 0, 25, 50)
	{0, 2500, 5000, 10000}, // (0, 25, 50, 100)
	{0, 0, 5000, 10000},
	{0, 10000, 100000, 200000}, // (0, 100, 1000, 2000)
}

const (
	STAFF categoryID = 1
	CAT_1 categoryID = 2
	CAT_2 categoryID = 3
	CAT_3 categoryID = 4
)

func main() {
	dryRun := false
	flag.BoolVar(&dryRun, "dry-run", false, "Dry run?")
	flag.Parse()

	logOptions := logger.LogOptions("debug", true, true)
	var withContext *logger.ContextLogger
	baselog := slog.NewTextHandler(os.Stdout, logOptions)
	withContext = &logger.ContextLogger{Handler: baselog}

	log := slog.New(withContext)
	slog.SetDefault(log)
	log.Debug("Dry run?", "dryRun", dryRun)
	err := godotenv.Load("../.env")
	if err != nil {
		panic(err)
	}
	ctx := context.Background()
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()
	config, err := config.New(getEnv, "development")
	if err != nil {
		panic(err)
	}

	if config.StripeSecretKey == "" {
		panic("Stripe secret key is required")
	}
	stripe.Key = config.StripeSecretKey

	db := repository.InitDB(ctx, config.DatabaseURL)
	defer db.Close()

	params := &stripe.ProductListParams{}
	params.Limit = stripe.Int64(100)
	prodList := product.List(params).ProductList().Data
	if len(prodList) == 0 {
		log.Info("No products found")
		os.Exit(1)
	}
	priceParams := &stripe.PriceListParams{}
	priceParams.Limit = stripe.Int64(100)
	allPrices := price.List(priceParams).PriceList().Data
	slog.Debug("Got prices", "count", len(allPrices))
	var facilities []models.Facility
	err = db.SelectContext(ctx, &facilities, `select * from facility;`)
	if err != nil {
		log.Error("failed to get facilities", "error", err)
		os.Exit(1)
	}
	var categories []models.Category
	err = db.SelectContext(ctx, &categories, `select * from category;`)
	if err != nil {
		log.Error("failed to get categories", "error", err)
		os.Exit(1)
	}

	facilityCategories := make(map[int64][]models.Category)
	for _, category := range categories {
		facilityCategories[category.FacilityID] = append(facilityCategories[category.FacilityID], category)
	}

	mapping, pricing := mapFacilityToStripeProduct(facilities, facilityCategories, prodList, allPrices)
	slog.Debug("Got mapping", "count", len(mapping))
	slog.Debug("Got pricing", "count", len(pricing))

	type resIdWithCategory struct {
		ID         int64 `db:"id"`
		CategoryID int64 `db:"category_id"`
	}

	var reservations []resIdWithCategory
	err = db.SelectContext(ctx, &reservations, getReservationCategory)
	if err != nil {
		log.Error("failed to get reservation categories", "error", err)
		os.Exit(1)
	}

	tx, err := db.Beginx()
	defer tx.Rollback()

	if err != nil {
		log.Error("failed to begin transaction", "error", err)
		os.Exit(1)
	}

	g, gctx := errgroup.WithContext(ctx)

	g.Go(func() error {

		slog.Debug("Routine A started")
		defer gctx.Done()

		for _, facility := range facilities {
			p := mapping[facility.ID]

			if p == nil {
				log.Info("No product found for facility", "facility", facility.Name)
				return err
			}
			slog.Debug("Updating product", "facility", facility.Name, "product", p.Name)
			if !dryRun {
				_, err = tx.ExecContext(gctx, `update facility set product_id = $1 where id = $2`, p.ID, facility.ID)
				if err != nil {
					log.Error("failed to update product", "error", err)
					return err
				}
			}
		}
		slog.Debug("Routine A finished")
		return nil
	})

	staff := make([]int64, 0)
	cat1 := make([]int64, 0)
	cat2 := make([]int64, 0)
	cat3 := make([]int64, 0)

	g.Go(func() error {

		slog.Debug("Routine B started")
		defer gctx.Done()
		for _, r := range reservations {
			switch getNewCategoryID(r.CategoryID) {
			case 1:
				staff = append(staff, r.ID)
			case 2:
				cat1 = append(cat1, r.ID)
			case 3:
				cat2 = append(cat2, r.ID)
			case 4:
				cat3 = append(cat3, r.ID)
			}
		}

		query, args, err := sqlx.In(updateReservationQuery, STAFF, staff)
		if err != nil {
			log.Error("failed to update reservation", "error", err)
			return err
		}
		query = tx.Rebind(query)
		slog.Debug("Updating reservation", "query", query, "args", args)
		if !dryRun {
			_, err = tx.ExecContext(ctx, query, args...)
			if err != nil {
				log.Error("failed to update reservation", "error", err)
				return err
			}
		}
		query, args, err = sqlx.In(updateReservationQuery, CAT_1, cat1)
		if err != nil {
			log.Error("failed to update reservation", "error", err)
			return err
		}
		query = tx.Rebind(query)
		slog.Debug("Updating reservation", "query", query, "args", args)
		if !dryRun {
			_, err = tx.ExecContext(ctx, query, args...)
			if err != nil {
				log.Error("failed to update reservation", "error", err)
				return err
			}
		}
		query, args, err = sqlx.In(updateReservationQuery, CAT_2, cat2)
		if err != nil {
			log.Error("failed to update reservation", "error", err)
			return err
		}
		query = tx.Rebind(query)
		slog.Debug("Updating reservation", "query", query, "args", args)
		if !dryRun {
			_, err = tx.ExecContext(ctx, query, args...)
			if err != nil {
				log.Error("failed to update reservation", "error", err)
				return err
			}
		}
		query, args, err = sqlx.In(updateReservationQuery, CAT_3, cat3)
		if err != nil {
			log.Error("failed to update reservation", "error", err)
			return err
		}
		query = tx.Rebind(query)
		slog.Debug("Updating reservation", "query", query, "args", args)
		if !dryRun {
			_, err = tx.ExecContext(ctx, query, args...)
			if err != nil {
				log.Error("failed to update reservation", "error", err)
				return err
			}
		}
		slog.Info("routine B finished")
		return nil
	})
	g.Go(func() error {
		slog.Debug("Routine C started")
		defer gctx.Done()
		for _, p := range pricing {
			_, err := tx.ExecContext(gctx, `insert into pricing (id, product_id, category_id, unit_label) values ($1, $2, $3, $4)`, p.ID, p.ProductID, p.CategoryID, p.UnitLabel)
			if err != nil {
				log.Error("failed to update product", "error", err)
				return err
			}
		}
		slog.Debug("Routine C finished")
		return nil
	})

	if err := g.Wait(); err != nil {
		log.Error("failed to update product", "error", err)
		tx.Rollback()
	}

	if !dryRun {
		if err := tx.Commit(); err != nil {
			log.Error("failed to commit transaction", "error", err)
			os.Exit(1)
		}
	}
	slog.Info("Done")
	os.Exit(0)
}

const updateReservationQuery = `update reservation set category_id = ? where id IN (?);`

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

const getReservationCategory = `select id, category_id from reservation;`

// a table with 124 rows has the same 4 rows repeated
// IE column 5 = 1, 6 = 2, 7 = 3, 8 = 4 etc
// function simply reduces the id to a 1-4 range
func getNewCategoryID(id int64) int64 {
	if id <= 4 {
		return id
	}
	return ((id-1)%4 + 1)
}

func mapFacilityToStripeProduct(
	facilities []models.Facility,
	categories map[int64][]models.Category,
	stripeProducts []*stripe.Product,
	allPrices []*stripe.Price,
) (map[int64]*stripe.Product, []models.Pricing) {
	mapping := make(map[int64]*stripe.Product)
	finalPricing := make([]models.Pricing, 0, len(allPrices))
	productPrices := make(map[string][]*stripe.Price)
	products := make(map[string]*stripe.Product)

	slog.Info("test length", "length", len(finalPricing))
	for _, p := range allPrices {
		productPrices[p.Product.ID] = append(productPrices[p.Product.ID], p)
	}
	for _, sp := range stripeProducts {
		products[sp.ID] = sp
	}

	for _, facility := range facilities {
		cats := categories[facility.ID]
		if cats == nil {
			continue
		}
		var prices []int64

		for _, c := range cats {
			prices = append(prices, int64(c.Price*100))
		}
		slices.Sort(prices)
		if prices[2] == 2500 && prices[3] == 2500 {
			prices = []int64{0, 0, 2500, 5000}
		}
		group := identifyPriceGroupCents(prices)
		if group == 0 {
			slog.Error("Could not identify price group", "facility", facility.Name, "prices", prices)
			continue
		}

		// Now match this group with a stripe product (choose how you distinguish)
		matched := false
		for _, sp := range stripeProducts {
			if stripeGroupMatches(group, sp, productPrices) {
				mapping[facility.ID] = sp
				matched = true
				break
			}
		}

		if !matched {
			slog.Error("No matching stripe product found", "facility", facility.Name, "group", group)
		}

	}

	count := 0
	for _, spr := range allPrices {
		count++
		slog.Debug("Processing Stripe price", "count", count, "id", spr.ID)
		var catID categoryID
		switch spr.Metadata["order_idx"] {
		case "0":
			catID = STAFF
		case "1":
			catID = CAT_1
		case "2":
			catID = CAT_2
		case "3":
			catID = CAT_3
		default:
			slog.Error("Unknown order idx", "order_idx", spr.Metadata["order_idx"])
		}
		ul := products[spr.Product.ID].UnitLabel
		finalPricing = append(finalPricing, models.Pricing{
			ID:         spr.ID,
			ProductID:  &spr.Product.ID,
			CategoryID: int64(catID),
			UnitLabel:  ul,
		})

	}
	if len(mapping) != len(facilities) {
		slog.Error("Not all facilities have been mapped", "facilities", len(facilities), "mapped", len(mapping))
	}

	return mapping, finalPricing
}

func identifyPriceGroupCents(prices []int64) int {
	for groupIndex, group := range priceGroups {
		if len(prices) != len(group) {
			continue
		}
		matched := true
		for i, p := range prices {
			if p != group[i] {
				matched = false
				break
			}
		}
		if matched {
			return groupIndex + 1
		}
	}
	return 0
}

func stripeGroupMatches(group int, product *stripe.Product, productPrices map[string][]*stripe.Price) bool {
	prices := productPrices[product.ID]
	if len(prices) == 0 {
		return false
	}
	switch group {
	case 1:
		return checkStripePriceValues(prices, priceGroups[0])
	case 2:
		return checkStripePriceValues(prices, priceGroups[1])
	case 3:
		return checkStripePriceValues(prices, priceGroups[2])
	case 4:
		return checkStripePriceValues(prices, priceGroups[3])
	}
	return false
}

func checkStripePriceValues(stripePrices []*stripe.Price, pattern []int64) bool {
	for i, sp := range stripePrices {
		price := sp.UnitAmount // Stripe provides this in cents (int64)

		if price != pattern[i] {
			return false
		}
	}
	return true
}
