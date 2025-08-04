package emails

import (
	"bytes"
	"context"
	"embed"
	"fmt"
	"html/template"
	"net/mail"
	"net/smtp"
	"os"
	"strings"
	"time"
)

//go:embed templates/*.html
var emailTemplates embed.FS

type EmailData struct {
	To       string
	Subject  string
	Template string
	Data     map[string]any
}

func Send(email *EmailData) {
	EmailSMTPHost := os.Getenv("EMAIL_HOST")
	EmailPassword := os.Getenv("EMAIL_PASSWORD")
	EmailUser := os.Getenv("EMAIL_USER")
	tmplBytes, err := emailTemplates.ReadFile("templates/" + email.Template)
	if err != nil {
		fmt.Printf("Failed to read email template: %v\n", err)
		return
	}
	funcMap := template.FuncMap{
		"safeHTML": func(s string) string {
			return template.HTMLEscaper(s)
		},
	}
	tmpl, err := template.New("base").Funcs(funcMap).Parse(string(tmplBytes))
	if err != nil {
		fmt.Printf("Failed to parse email template: %v\n", err)
		return
	}

	var body bytes.Buffer
	err = tmpl.Execute(&body, email.Data)
	if err != nil {
		fmt.Printf("Failed to execute email template: %v\n", err)
		return
	}

	auth := smtp.PlainAuth("", EmailUser, EmailPassword, EmailSMTPHost)
	from := mail.Address{Name: "Flexforms Update", Address: EmailUser}
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"

	subject := "Subject: " + email.Subject + "!\n"
	header := "From: " + from.Name + "<" + from.Address + ">\n"
	msg := []byte(header + subject + mime + "\n" + body.String())
	recipients := strings.Split(email.To, ",")
	for i, recipient := range recipients {
		recipients[i] = strings.TrimSpace(recipient)
	}

	done := make(chan error, 1)
	go func() {
		done <- smtp.SendMail(EmailSMTPHost+":587", auth, EmailUser, recipients, msg)
	}()
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	select {
	case <-ctx.Done():
		fmt.Printf("Email Sent\n")
	case err := <-done:
		if err != nil {
			fmt.Printf("Failed to send email: %v\n", err)
		}

	}
}
