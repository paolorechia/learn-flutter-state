import 'package:bloc_todo/models/user.dart';
import 'package:equatable/equatable.dart';


class AuthenticationResult extends Equatable {
    final String token;
    final User? user;

    const AuthenticationResult({
      required this.token,
      this.user,
    });

    @override
    List<Object> get props => [token];
}
