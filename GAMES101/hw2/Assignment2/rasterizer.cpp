//
// Created by goksu on 4/6/19.
//

#include "rasterizer.hpp"

#include <math.h>

#include <algorithm>
#include <opencv2/opencv.hpp>
#include <vector>

rst::pos_buf_id rst::rasterizer::load_positions(
    const std::vector<Eigen::Vector3f>& positions) {
  auto id = get_next_id();
  pos_buf.emplace(id, positions);

  return {id};
}

rst::ind_buf_id rst::rasterizer::load_indices(
    const std::vector<Eigen::Vector3i>& indices) {
  auto id = get_next_id();
  ind_buf.emplace(id, indices);

  return {id};
}

rst::col_buf_id rst::rasterizer::load_colors(
    const std::vector<Eigen::Vector3f>& cols) {
  auto id = get_next_id();
  col_buf.emplace(id, cols);

  return {id};
}

auto to_vec4(const Eigen::Vector3f& v3, float w = 1.0f) {
  return Vector4f(v3.x(), v3.y(), v3.z(), w);
}

static bool insideTriangle(int x, int y, const Vector3f* _v) {
  // Compute vectors
  Eigen::Vector2f v0 = _v[1].head<2>() - _v[0].head<2>();
  Eigen::Vector2f v1 = _v[2].head<2>() - _v[1].head<2>();
  Eigen::Vector2f v2 = _v[0].head<2>() - _v[2].head<2>();

  // Compute dot products
  Eigen::Vector2f pt(x, y);
  Eigen::Vector2f d0 = pt - _v[0].head<2>();
  Eigen::Vector2f d1 = pt - _v[1].head<2>();
  Eigen::Vector2f d2 = pt - _v[2].head<2>();

  // Compute cross products to get the sign of the angle
  float sign0 = v0.x() * d0.y() - v0.y() * d0.x();
  float sign1 = v1.x() * d1.y() - v1.y() * d1.x();
  float sign2 = v2.x() * d2.y() - v2.y() * d2.x();

  // Determine if the point is in the triangle using the cross product signs
  bool has_neg = (sign0 < 0) || (sign1 < 0) || (sign2 < 0);
  bool has_pos = (sign0 > 0) || (sign1 > 0) || (sign2 > 0);

  // Point is in the triangle if it's on the same side of all edges
  return !(has_neg && has_pos);
}

static std::tuple<float, float, float> computeBarycentric2D(float x, float y,
                                                            const Vector3f* v) {
  float c1 =
      (x * (v[1].y() - v[2].y()) + (v[2].x() - v[1].x()) * y +
       v[1].x() * v[2].y() - v[2].x() * v[1].y()) /
      (v[0].x() * (v[1].y() - v[2].y()) + (v[2].x() - v[1].x()) * v[0].y() +
       v[1].x() * v[2].y() - v[2].x() * v[1].y());
  float c2 =
      (x * (v[2].y() - v[0].y()) + (v[0].x() - v[2].x()) * y +
       v[2].x() * v[0].y() - v[0].x() * v[2].y()) /
      (v[1].x() * (v[2].y() - v[0].y()) + (v[0].x() - v[2].x()) * v[1].y() +
       v[2].x() * v[0].y() - v[0].x() * v[2].y());
  float c3 =
      (x * (v[0].y() - v[1].y()) + (v[1].x() - v[0].x()) * y +
       v[0].x() * v[1].y() - v[1].x() * v[0].y()) /
      (v[2].x() * (v[0].y() - v[1].y()) + (v[1].x() - v[0].x()) * v[2].y() +
       v[0].x() * v[1].y() - v[1].x() * v[0].y());
  return {c1, c2, c3};
}

void rst::rasterizer::draw(pos_buf_id pos_buffer, ind_buf_id ind_buffer,
                           col_buf_id col_buffer, Primitive type) {
  auto& buf = pos_buf[pos_buffer.pos_id];
  auto& ind = ind_buf[ind_buffer.ind_id];
  auto& col = col_buf[col_buffer.col_id];

  float f1 = (50 - 0.1) / 2.0;
  float f2 = (50 + 0.1) / 2.0;

  Eigen::Matrix4f mvp = projection * view * model;
  for (auto& i : ind) {
    Triangle t;
    Eigen::Vector4f v[] = {mvp * to_vec4(buf[i[0]], 1.0f),
                           mvp * to_vec4(buf[i[1]], 1.0f),
                           mvp * to_vec4(buf[i[2]], 1.0f)};
    // Homogeneous division
    for (auto& vec : v) {
      vec /= vec.w();
    }
    // Viewport transformation
    for (auto& vert : v) {
      vert.x() = 0.5 * width * (vert.x() + 1.0);
      vert.y() = 0.5 * height * (vert.y() + 1.0);
      vert.z() = vert.z() * f1 + f2;
    }

    for (int i = 0; i < 3; ++i) {
      t.setVertex(i, v[i].head<3>());
      t.setVertex(i, v[i].head<3>());
      t.setVertex(i, v[i].head<3>());
    }

    auto col_x = col[i[0]];
    auto col_y = col[i[1]];
    auto col_z = col[i[2]];

    t.setColor(0, col_x[0], col_x[1], col_x[2]);
    t.setColor(1, col_y[0], col_y[1], col_y[2]);
    t.setColor(2, col_z[0], col_z[1], col_z[2]);

    rasterize_triangle(t);
  }
}

// Screen space rasterization
void rst::rasterizer::rasterize_triangle(const Triangle& t) {
  auto v = t.toVector4();

  // iterate through the pixel and find if the current pixel is inside the
  // triangle
  float minX = std::min(v[0].x(), std::min(v[1].x(), v[2].x()));
  float maxX = std::max(v[0].x(), std::max(v[1].x(), v[2].x()));
  float minY = std::min(v[0].y(), std::min(v[1].y(), v[2].y()));
  float maxY = std::max(v[0].y(), std::max(v[1].y(), v[2].y()));

  // If so, use the following code to get the interpolated z value.
  // auto[alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
  // float w_reciprocal = 1.0/(alpha / v[0].w() + beta / v[1].w() + gamma /
  // v[2].w()); float z_interpolated = alpha * v[0].z() / v[0].w() + beta *
  // v[1].z() / v[1].w() + gamma * v[2].z() / v[2].w(); z_interpolated *=
  // w_reciprocal;

  // the triangle (use getColor function) if it should be painted.
  for (int x = minX; x <= maxX; ++x) {
    for (int y = minY; y <= maxY; ++y) {
      if (insideTriangle(x, y, t.v)) {
        auto [alpha, beta, gamma] = computeBarycentric2D(x, y, t.v);
        float w_reciprocal =
            1.0 / (alpha / v[0].w() + beta / v[1].w() + gamma / v[2].w());
        float z_interpolated = alpha * v[0].z() / v[0].w() +
                               beta * v[1].z() / v[1].w() +
                               gamma * v[2].z() / v[2].w();
        z_interpolated *= w_reciprocal;

        if (z_interpolated < depth_buf[get_index(x, y)]) {
          set_pixel(Vector3f(x, y, z_interpolated), t.getColor());
          depth_buf[get_index(x, y)] = z_interpolated;
        }
      }
    }
  }
}

void rst::rasterizer::set_model(const Eigen::Matrix4f& m) { model = m; }

void rst::rasterizer::set_view(const Eigen::Matrix4f& v) { view = v; }

void rst::rasterizer::set_projection(const Eigen::Matrix4f& p) {
  projection = p;
}

void rst::rasterizer::clear(rst::Buffers buff) {
  if ((buff & rst::Buffers::Color) == rst::Buffers::Color) {
    std::fill(frame_buf.begin(), frame_buf.end(), Eigen::Vector3f{0, 0, 0});
  }
  if ((buff & rst::Buffers::Depth) == rst::Buffers::Depth) {
    std::fill(depth_buf.begin(), depth_buf.end(),
              std::numeric_limits<float>::infinity());
  }
}

rst::rasterizer::rasterizer(int w, int h) : width(w), height(h) {
  frame_buf.resize(w * h);
  depth_buf.resize(w * h);
}

int rst::rasterizer::get_index(int x, int y) {
  return (height - 1 - y) * width + x;
}

void rst::rasterizer::set_pixel(const Eigen::Vector3f& point,
                                const Eigen::Vector3f& color) {
  // old index: auto ind = point.y() + point.x() * width;
  auto ind = (height - 1 - point.y()) * width + point.x();
  frame_buf[ind] = color;
}