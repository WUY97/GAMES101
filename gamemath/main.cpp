#include <eigen3/Eigen/Eigen>
#include <iostream>

constexpr double MY_PI = 3.1415926;

class Chapter5 {
 public:
  void computeAngleBetweenTwoVectors(std::string number, Eigen::Vector2f v1,
                                     Eigen::Vector2f v2) {
    float dotProduct = v1.dot(v2);
    float v1Norm = v1.norm();
    float v2Norm = v2.norm();
    float angle = std::acos(dotProduct / (v1Norm * v2Norm));
    std::vector<std::pair<std::string, float>> results = {{"angle", angle}};
    printResult(number, results);
  };

  void getPerpendicularAndParallel(std::string number, Eigen::Vector3f n,
                                   Eigen::Vector3f v) {
    Eigen::Vector3f vParallel = (v.dot(n) / n.dot(n)) * n;
    Eigen::Vector3f vPerpendicular = v - vParallel;
    std::vector<std::pair<std::string, Eigen::Vector3f>> results = {
        {"parallel", vParallel}, {"perpendicular", vPerpendicular}};
    printResult(number, results);
  };

 private:
  template <typename T>
  void printResult(const std::string& number,
                   const std::vector<std::pair<std::string, T>>& results) {
    std::cout << number << ": " << std::endl;
    for (const auto& r : results) {
      std::cout << r.first << ": " << std::endl;
      std::cout << r.second << std::endl;
    }
    std::cout << std::string(20, '-') << std::endl;
  };
};

int main(int argc, const char** argv) {
  Chapter5 a;

  // Chapter 5
  // 5.6
  a.computeAngleBetweenTwoVectors("5.6", Eigen::Vector2f(1, 2),
                                  Eigen::Vector2f(-6, 3));

  // 5.7
  a.getPerpendicularAndParallel(
      "5.7", Eigen::Vector3f(4, 3, -1),
      Eigen::Vector3f(std::pow(2, 0.5) / 2, std::pow(2, 0.5) / 2, 0));
  return 0;
}
