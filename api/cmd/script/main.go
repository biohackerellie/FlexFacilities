package main

import (
	pg "api/internal/db"
	"api/internal/models"
	"context"
	"flag"
	"fmt"
	"log"
	"math/rand"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	envPath := flag.String("env", "", "path to env file")
	flag.Parse()
	if envPath != nil && *envPath != "" {
		err := godotenv.Load(*envPath)
		if err != nil {
			panic(err)
		}
	}
	ctx := context.Background()
	db := pg.NewDB(ctx, getEnv("DATABASE_URL", "postgres://postgres@localhost:5432/postgres?sslmode=disable"))
	defer db.Close()

	// seed random buildings
	buildings := []models.Building{}

	for range 10 {
		var building models.Building
		if err := db.Get(&building, insertBuildingsQuery, randomName(), "some address"); err != nil {
			log.Fatal(err)
		}
		buildings = append(buildings, building)
	}
	// seed 100 random facilities, 10 for each building

	for _, b := range buildings {
		for range 10 {
			facility := Facility{
				Name:             randomName(),
				BuildingID:       b.ID,
				GoogleCalendarID: randomName(),
			}

			_, err := db.ExecContext(ctx, insertFacilities, facility.Name, facility.BuildingID, facility.GoogleCalendarID)
			if err != nil {
				log.Fatal(err)
			}
		}
	}

}

func getEnv(key, fallback string) string {
	if value, ok := os.LookupEnv(key); ok {
		return value
	}
	return fallback
}

const insertBuildingsQuery = `INSERT INTO building (name, address) VALUES ($1, $2) RETURNING *`
const insertFacilities = `INSERT INTO facility (name, building_id, google_calendar_id) VALUES ($1, $2, $3)`

var sillyNames = []string{
	"wigglyMcJiggles",
	"fluffernugget",
	"sirBoopsALot",
	"nibblesMcSnort",
	"toastyWaffles",
	"queenOfSpaghetti",
	"captainSnugglebeard",
	"wobblekins",
	"snazzyMuffin",
	"pickleSprout",
	"doodleFloop",
	"blorpyMcSnoot",
	"chonkzilla",
	"spaghettisaurus",
	"sassyPantsMcGee",
	"bloopadoop",
	"wiggleToast",
	"sniffleBuns",
	"taterTotTitan",
	"flibberwump",
	"donutWizard",
	"crumpetCactus",
	"puddingPixel",
	"twinkleSnort",
	"mochaMooMoo",
	"borkSandwich",
	"waddleWumpus",
	"snugglepuff",
	"captainQuirk",
	"marshmallowBandit",
	"drJellybeans",
	"fiddleFaddle",
	"tootsieBlizzard",
	"goblinNoodle",
	"noodleFroodle",
	"ticklePickle",
	"mrSprinklePop",
	"tinyWumbus",
	"muffinChariot",
	"glitterBeard",
	"sporkinator",
	"flapjackFiasco",
	"cuddleSprout",
	"zestyBumble",
	"pogoMcSnaz",
	"theQuacktitioner",
	"bananaPhantom",
	"waffleRider",
	"churroComet",
	"fuzzyDoorknob",
	"meowserTruck",
	"lumpyPotato",
	"snorkleTaco",
	"crankyCupcake",
	"boatswainBubbles",
	"pirateChimp",
	"owltopus",
	"biscuitsAndBandits",
	"groovyTurnip",
	"majesticWombat",
	"bloopTheThird",
	"peachyKeenBurrito",
	"sergeantSprout",
	"dizzyWigglehorn",
	"bubbleMcSnout",
	"donutDragon",
	"princeOfPickles",
	"fluffyBiscuits",
	"snortleBot",
	"beepboopBanana",
	"mysticMarzipan",
	"professorWobble",
	"napoleonFluff",
	"tacoSaurusRex",
	"goobertMcFlap",
	"zoodleDoodle",
	"biscuitMonster",
	"puffalump",
	"chocoWobble",
	"buttonBean",
	"sprinkleFidget",
	"rascalMcCheese",
	"doodleSnaps",
	"woozyBanana",
	"snuggleNoodle",
	"gravyStorm",
	"honkulusPrime",
	"baronVonBloop",
	"plopMcMuffin",
	"ticklishTurnip",
	"bubblegumKnight",
	"nachoFiasco",
	"pumpernickelPilot",
	"waffleWizard",
	"captainCrumble",
	"mangoWumbus",
	"snorkleberryPie",
	"mrFizzleSnout",
	"crispyPicklePup",
	"happyWumbleBop",
	"fuzzleWug",
}

func randomName() string {
	return fmt.Sprintf("%s %s", sillyNames[rand.Intn(len(sillyNames))], sillyNames[rand.Intn(len(sillyNames))])
}

type Facility struct {
	ID               int64  `db:"id" json:"id"`
	Name             string `db:"name" json:"name"`
	GoogleCalendarID string `db:"google_calendar_id" json:"google_calendar_id"`
	BuildingID       int64  `db:"building_id" json:"building_id"`
}
type Building struct {
	ID               int64   `db:"id" json:"id"`
	Name             string  `db:"name" json:"name"`
	Address          string  `db:"address" json:"address"`
	ImagePath        *string `db:"image_path" json:"image_path"`
	GoogleCalendarID *string `db:"google_calendar_id" json:"google_calendar_id"`
}
