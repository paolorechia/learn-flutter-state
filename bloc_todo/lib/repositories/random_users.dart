import 'package:bloc_todo/models/random_user.dart';
import 'package:bloc_todo/apis/random_user.dart';
import 'package:logger/logger.dart';

var logger = Logger();

class RandomUserRepository {
  RandomUserRepository() {
    logger.i('RandomUserRepository created');
  }

  Future<List<RandomUser>> getRandomUsers() async {
    return await fetchRandomUser().then((result) => result.results);
  }

  void dispose() {
    logger.i('RandomUserRepository disposed');
  }
}
