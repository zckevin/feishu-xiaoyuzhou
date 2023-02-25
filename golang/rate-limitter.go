package main

import (
	"sync"
	"time"
)

type RateLimitter struct {
	mu          sync.Mutex
	history     map[string]time.Time
	cleanTicker *time.Ticker
}

func NewRateLimitter(cleanInterval time.Duration) *RateLimitter {
	rl := &RateLimitter{
		history: make(map[string]time.Time),
	}
	rl.cleanTicker = time.NewTicker(cleanInterval)
	go func() {
		for range rl.cleanTicker.C {
			rl.doClean()
		}
	}()
	return rl
}

func (rl *RateLimitter) doClean() {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	for key, expiration := range rl.history {
		if time.Now().After(expiration) {
			delete(rl.history, key)
		}
	}
}

func (rl *RateLimitter) hasNonExpiredKey(key string) bool {
	if expiration, ok := rl.history[key]; ok {
		return time.Now().Before(expiration)
	}
	return false
}

func (rl *RateLimitter) AddKey(key string, duration time.Duration) bool {
	rl.mu.Lock()
	defer rl.mu.Unlock()
	if rl.hasNonExpiredKey(key) {
		return false
	}
	rl.history[key] = time.Now().Add(duration)
	return true
}

func (rl *RateLimitter) Close() {
	rl.cleanTicker.Stop()
	rl.cleanTicker = nil
}
