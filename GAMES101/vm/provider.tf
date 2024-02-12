provider "google" {
  project                     = var.PROJECT_ID
  region                      = var.REGION
  zone                        = var.ZONE
  impersonate_service_account = var.TF_SERVICE_ACCOUNT
  credentials                 = file(var.CREADENTIALS_PATH)
}

data "google_client_config" "provider" {}

provider "kubernetes" {
  host  = google_container_cluster.gke_cluster.endpoint
  token = data.google_client_config.provider.access_token
  cluster_ca_certificate = base64decode(
    google_container_cluster.gke_cluster.master_auth[0].cluster_ca_certificate
  )
}
