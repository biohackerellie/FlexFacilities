package workers

import (
	"context"
	"fmt"
	"sync"
)

type Worker interface {
	Name() string

	Run(ctx context.Context)
}

type Manager struct {
	workers []Worker
	errCh   chan error
}

func NewManager() *Manager {
	return &Manager{
		workers: make([]Worker, 0),
		errCh:   make(chan error),
	}
}

func (wm *Manager) Add(w Worker) {
	wm.workers = append(wm.workers, w)
}

func (wm *Manager) Errors() <-chan error {
	return wm.errCh
}

func (wm *Manager) Start(ctx context.Context) {
	var wg sync.WaitGroup
	for _, w := range wm.workers {
		wg.Add(1)
		go func(ww Worker) {
			defer wg.Done()
			if err := runWorkerSafely(ctx, ww); err != nil {
				wm.errCh <- fmt.Errorf("worker %s failed: %w", ww.Name(), err)
			}
		}(w)
	}
	go func() {
		wg.Wait()
		close(wm.errCh)
	}()
}

func runWorkerSafely(ctx context.Context, w Worker) (err error) {
	defer func() {
		if r := recover(); r != nil {
			err = fmt.Errorf("worker %s panicked: %v", w.Name(), r)
		}
	}()
	w.Run(ctx)
	return nil
}

func NewWorker(w Worker) Worker {

	return &struct {
		Worker
	}{
		Worker: w,
	}
}
