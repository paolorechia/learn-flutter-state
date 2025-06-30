import 'package:equatable/equatable.dart';


class AuthenticationResult extends Equatable {
    final String token;
    final bool isAuthenticated;

    const AuthenticationResult({
      required this.token,
      required this.isAuthenticated,
    });

    @override
    List<Object> get props => [token, isAuthenticated];
}