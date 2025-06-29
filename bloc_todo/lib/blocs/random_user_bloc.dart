import 'package:bloc_todo/repositories/random_users.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:bloc_concurrency/bloc_concurrency.dart';
import 'package:bloc_todo/models/random_user.dart';

// events
sealed class RandomUserEvent {}

final class RandomUserEventRequested extends RandomUserEvent {}


enum RandomUserRequestStatus { initial, loading, success, failure }

// state
class RandomUserState extends Equatable {
  const RandomUserState._({
    this.status = RandomUserRequestStatus.initial,
    this.users = const [],
  });

  const RandomUserState() : this._();

  final RandomUserRequestStatus status;
  final List<RandomUser> users;

  @override
  List<Object> get props => [status, users];
}


// bloc
class RandomUserBloc extends Bloc<RandomUserEvent, RandomUserState> {
  RandomUserBloc(
    {required RandomUserRepository randomUserRepository}
  ): _randomUserRepository = randomUserRepository, super(const RandomUserState()) {

    on<RandomUserEventRequested>(
      _onRandomUserEventRequested,
      transformer: restartable(),
    );
  }

  final RandomUserRepository _randomUserRepository;

  void _onRandomUserEventRequested(
    RandomUserEventRequested event,
    Emitter<RandomUserState> emit,
  ) async {
    emit(
      RandomUserState._(
        status: RandomUserRequestStatus.loading,
        users: state.users, // Keep existing users during loading
      )
    );
    
    print("Fetching...");

    try {
      await Future.delayed(Duration(seconds: 1));
      List<RandomUser> randomUsers = await _randomUserRepository.getRandomUsers();
      print("Fetched random user ${randomUsers}");
      emit(
        RandomUserState._(
          status: RandomUserRequestStatus.success,
          users: randomUsers,
        ),
      );
      print("Emitted success");
    } catch (error) {
      emit(
        RandomUserState._(
          status: RandomUserRequestStatus.failure,
          users: state.users, // Keep existing users on error
        ),
      );
    }
  }

}




