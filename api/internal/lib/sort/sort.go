package sort

import (
	"time"
)

func BubbleSortTimes(t []time.Time) []time.Time {
	for i := range t {
		for j := 0; j < len(t)-i-1; j++ {
			if t[j].After(t[j+1]) {
				t[j], t[j+1] = t[j+1], t[j]
			}
		}
	}
	return t
}
