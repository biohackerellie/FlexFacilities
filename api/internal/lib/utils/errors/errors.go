package errors

type IgnorableError struct {
	msg string
}

func (ie IgnorableError) Error() string {
	return ie.msg
}

func NewIgnorableError(message string) error {
	return &IgnorableError{msg: message}
}

var ErrIgnorable = &IgnorableError{}
