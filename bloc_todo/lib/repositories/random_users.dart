import '../apis/random_user.dart';

class RandomUserRepository {
  RandomUserRepository() {
    print('RandomUserRepository created');
  }

  Future<List<RandomUser>> getRandomUsers() async {
    return await fetchRandomUser().then((result) => result.results);
  }

  void dispose() {
    print('RandomUserRepository disposed');
  }
}