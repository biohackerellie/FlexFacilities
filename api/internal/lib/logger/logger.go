package logger

import (
	"fmt"
	log "log/slog"
	"strconv"
)

const (
	RESET   = "\033[0m"
	RED     = "\033[31m"
	GREEN   = "\033[32m"
	YELLOW  = "\033[33m"
	BLUE    = "\033[34m"
	MAGENTA = "\033[35m"
	CYAN    = "\033[36m"
)

func LogOptions(logLevel string, verbose bool, local bool) *log.HandlerOptions {
	var level log.Level
	switch logLevel {
	case "debug":
		level = log.LevelDebug
	case "info":
		level = log.LevelInfo
	case "warn":
		level = log.LevelWarn
	case "error":
		level = log.LevelError
	default:
		level = log.LevelInfo
	}

	levelColors := map[log.Level]string{
		log.LevelDebug: MAGENTA,
		log.LevelInfo:  BLUE,
		log.LevelWarn:  YELLOW,
		log.LevelError: RED,
	}

	config := &log.HandlerOptions{
		Level:     level,
		AddSource: true,
		ReplaceAttr: func(groups []string, a log.Attr) log.Attr {
			switch a.Key {
			case log.TimeKey:
				a.Value = log.StringValue(a.Value.Time().Format("01/02/2006 15:04:05"))
				if !verbose {
					return log.Attr{}
				}
			case log.SourceKey:
				source := a.Value.Any().(*log.Source)
				if local && verbose {
					// Use a different strategy for local logging
					sourceInfo := fmt.Sprintf("%s:%s", CYAN+source.Function+RESET, GREEN+strconv.Itoa(source.Line)+RESET+"\n")
					a.Value = log.StringValue(sourceInfo)
					a.Key = "src"
					return log.Attr{}
				} else {
					// For non-local or non-verbose, return plain source info
					sourceInfo := fmt.Sprintf("%s:%d", source.Function, source.Line)
					a.Value = log.StringValue(sourceInfo)
					a.Key = "src"
				}

				if !verbose {
					return log.Attr{}
				}
			case log.LevelKey:
				level := a.Value.Any().(log.Level)
				color := levelColors[level]
				fmt.Print(color + " " + a.Value.String() + RESET + " ")
				return log.Attr{}
			case log.MessageKey:
				if local {
					fmt.Print(a.Value, RESET, " ")
					return log.Attr{}
				}
			}
			return a
		},
	}
	return config
}
