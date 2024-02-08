variable "PROJECT_ID" {
  description = "The GCP project ID"
  type        = string
  default     = "t-pulsar-412422"
}

variable "CREADENTIALS_PATH" {
  description = "The GCP service account credentials path"
  type        = string
  default     = "./t-pulsar-412422-8f261e630db9.json"

}

variable "REGION" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "ZONE" {
  description = "The GCP zone"
  type        = string
  default     = "us-central1-f"
}

variable "TF_SERVICE_ACCOUNT" {
  description = "The GCP service account to impersonate"
  type        = string
  default     = "sa-gomicro-tf-mac@t-pulsar-412422.iam.gserviceaccount.com"
}

variable "VM_NAME" {
  description = "The GCP VM name"
  type        = string
  default     = "games101"

}

variable "MACHINE_TYPE" {
  description = "The GCP machine type"
  type        = string
  default     = "n1-standard-1"
}

variable "GPU_TYPE" {
  description = "The GCP GPU type"
  type        = string
  default     = "nvidia-tesla-t4"
}

variable "IMAGE" {
  description = "The GCP image"
  type        = string
  default     = "ubuntu-os-cloud/ubuntu-2004-lts"
}

variable "DOMAIN" {
  description = "The GCP domain"
  type        = string
  default     = "smoliv.dev"
}

variable "PUBLIC_KEY_PATH" {
  description = "The path to the public key"
  type        = string
  default     = "~/.ssh/id_rsa.pub"
}
