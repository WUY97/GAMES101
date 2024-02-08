resource "google_compute_instance" "default" {
  name         = var.VM_NAME
  machine_type = var.MACHINE_TYPE
  zone         = var.ZONE

  boot_disk {
    initialize_params {
      image = var.IMAGE
    }
  }

  network_interface {
    network = "default"
    access_config {
    }
  }

  service_account {
    email  = var.TF_SERVICE_ACCOUNT
    scopes = ["https://www.googleapis.com/auth/cloud-platform"]
  }

  metadata_startup_script = templatefile("./startup.sh", {})

  metadata = {
    ssh-keys = "ubuntu:${file(var.PUBLIC_KEY_PATH)}"
  }

  guest_accelerator {
    type  = var.GPU_TYPE
    count = 1
  }

  scheduling {
    preemptible         = false
    on_host_maintenance = "TERMINATE"
    automatic_restart   = true
  }
}
