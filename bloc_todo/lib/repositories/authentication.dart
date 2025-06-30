import 'package:bloc_todo/apis/express_api.dart';
import 'package:bloc_todo/models/authentication.dart';
import 'package:bloc_todo/models/user.dart';

class AuthenticationRepository {
  AuthenticationRepository() {
    print('AuthenticationRepository created');
  }

  AuthenticationRepository.injected({required this.expressApi}) {
    print('AuthenticationRepository created');
    print('AuthenticationRepository created with injected test api');
    this.expressApi = expressApi;
  }

  ExpressApi expressApi = ExpressApi();

  Future<AuthenticationResult> login(String username, String password) async {
    final result = await expressApi.login(username, password);

    if (result.success) {
      final token = result.data?['token'] as String;
      final user = User.fromJson(result.data?['user'] as Map<String, dynamic>);
      return AuthenticationResult(token: token, user: user);
    } else {
      throw Exception(result.message);
    }
  }

  void dispose() {
    print('AuthenticationRepository disposed');
  }
}
