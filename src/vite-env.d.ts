/// <reference types="vite/client" />

// Add project-specific environment variables used in this app
interface ImportMetaEnv {
	readonly VITE_SUPABASE_URL: string
	readonly VITE_SUPABASE_ANON_KEY: string
	// more env vars can be added here as needed
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
