import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:bloc_concurrency/bloc_concurrency.dart';
import 'package:bloc_todo/repositories/authentication.dart';
import 'package:bloc_todo/models/user.dart';

// events
sealed class AuthenticationEvent {}

final class SignInEvent extends AuthenticationEvent {
  final String username;
  final String password;

  SignInEvent({required this.username, required this.password});
}

final class SignOutEvent extends AuthenticationEvent {}

final class CredentialsExpiredEvent extends AuthenticationEvent {}

enum AuthenticationStatus { unknown, loading, authenticated, unauthenticated }

// state
class AuthenticationState {
  User? user;
  String token;
  AuthenticationStatus status = AuthenticationStatus.unknown;

  AuthenticationState({
    this.user,
    this.token = "",
    this.status = AuthenticationStatus.unknown,
  });

  AuthenticationState.unauthenticated({
    this.token = "",
    this.status = AuthenticationStatus.unauthenticated,
  });

  AuthenticationState.loading({
    this.token = "",
    this.status = AuthenticationStatus.loading,
  });
}

// bloc
class AuthenticationBloc
    extends Bloc<AuthenticationEvent, AuthenticationState> {
  AuthenticationBloc({
    required AuthenticationRepository authenticationRepository,
  }) : _authenticationRepository = authenticationRepository,
       super(AuthenticationState()) {
    on<SignInEvent>(_onSignInEvent, transformer: sequential());
    on<SignOutEvent>(_onSignOutEvent, transformer: sequential());
  }

  final AuthenticationRepository _authenticationRepository;

  void _onSignInEvent(
    SignInEvent event,
    Emitter<AuthenticationState> emit,
  ) async {
    emit(AuthenticationState.loading());

    try {
      var authenticationResult = await _authenticationRepository.login(
        event.username,
        event.password,
      );
      emit(
        AuthenticationState(
          token: authenticationResult.token,
          user: authenticationResult.user,
          status: AuthenticationStatus.authenticated,
        ),
      );
    } catch (error) {
      emit(AuthenticationState.unauthenticated());
    }
  }

  void _onSignOutEvent(SignOutEvent event, Emitter<AuthenticationState> emit) {
    emit(AuthenticationState.unauthenticated());
  }
}
