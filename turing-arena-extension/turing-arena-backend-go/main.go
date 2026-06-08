package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	corsCfg := cors.DefaultConfig()
	corsCfg.AllowAllOrigins = true
	corsCfg.AllowHeaders = []string{"Authorization", "Content-Type"}
	corsCfg.AllowMethods = []string{"POST", "OPTIONS"}
	r.Use(cors.New(corsCfg))

	r.MaxMultipartMemory = 50 << 20

	r.POST("/api/chat", handleChat)

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	log.Printf("Turing Arena Backend (Go) proxy running on http://localhost:%s", port)
	log.Printf("Ready to receive requests from the Chrome Extension.")
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("server failed: %v", err)
	}
}
