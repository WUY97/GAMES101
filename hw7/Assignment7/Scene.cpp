//
// Created by Göksu Güvendiren on 2019-05-14.
//

#include "Scene.hpp"

void Scene::buildBVH() {
  printf(" - Generating BVH...\n\n");
  this->bvh = new BVHAccel(objects, 1, BVHAccel::SplitMethod::NAIVE);
}

Intersection Scene::intersect(const Ray &ray) const {
  return this->bvh->Intersect(ray);
}

void Scene::sampleLight(Intersection &pos, float &pdf) const {
  float emit_area_sum = 0;
  for (uint32_t k = 0; k < objects.size(); ++k) {
    if (objects[k]->hasEmit()) {
      emit_area_sum += objects[k]->getArea();
    }
  }
  float p = get_random_float() * emit_area_sum;
  emit_area_sum = 0;
  for (uint32_t k = 0; k < objects.size(); ++k) {
    if (objects[k]->hasEmit()) {
      emit_area_sum += objects[k]->getArea();
      if (p <= emit_area_sum) {
        objects[k]->Sample(pos, pdf);
        break;
      }
    }
  }
}

bool Scene::trace(const Ray &ray, const std::vector<Object *> &objects,
                  float &tNear, uint32_t &index, Object **hitObject) {
  *hitObject = nullptr;
  for (uint32_t k = 0; k < objects.size(); ++k) {
    float tNearK = kInfinity;
    uint32_t indexK;
    Vector2f uvK;
    if (objects[k]->intersect(ray, tNearK, indexK) && tNearK < tNear) {
      *hitObject = objects[k];
      tNear = tNearK;
      index = indexK;
    }
  }

  return (*hitObject != nullptr);
}

// Implementation of Path Tracing
Vector3f Scene::castRay(const Ray &ray, int depth) const {
  // TODO Implement Path Tracing Algorithm here
  Intersection intersection = Scene::intersect(ray);
  if (!intersection.happened) {
    return Vector3f(0.0f, 0.0f, 0.0f);
  }

  Vector3f hit_point = intersection.coords;
  Vector3f N = intersection.normal;
  Material *m = intersection.m;

  Vector3f L_dir(0.0f), L_indir(0.0f);

  Intersection inter_light;
  float pdf_light;
  sampleLight(inter_light, pdf_light);

  Vector3f dir_p_x = (inter_light.coords - hit_point).normalized();
  Ray ray_p_x(hit_point + EPSILON * N, dir_p_x);
  Intersection inter_p_x = Scene::intersect(ray_p_x);

  if (inter_p_x.happened && inter_p_x.m->hasEmission()) {
    Vector3f NN = inter_p_x.normal;
    L_dir = inter_p_x.m->m_emission * m->eval(ray.direction, dir_p_x, N) *
            dotProduct(dir_p_x, N) * dotProduct(-dir_p_x, NN) /
            inter_p_x.distance / pdf_light;
  }

  if (get_random_float() <= RussianRoulette) {
    Vector3f dir_i = m->sample(ray.direction, N).normalized();
    Ray ray_p_diri(hit_point, dir_i);
    Intersection inter_p_diri = Scene::intersect(ray_p_diri);

    if (inter_p_diri.happened && !inter_p_diri.m->hasEmission()) {
      L_indir = castRay(ray_p_diri, depth + 1) *
                m->eval(ray.direction, dir_i, N) * dotProduct(dir_i, N) /
                m->pdf(ray.direction, dir_i, N) / RussianRoulette;
    }
  }

  return m->getEmission() + L_dir + L_indir;
}