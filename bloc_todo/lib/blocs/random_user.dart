import 'package:bloc_todo/repositories/random_users.dart';
import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
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
  List<Object> get props => [];
}


// bloc
class RandomUserBloc
  extends Bloc<RandomUserEvent, RandomUserState> {
    RandomUserBloc({
      required RandomUserRepository randomUserRepository
    }): _randomUserRepository = randomUserRepository,
        super(const RandomUserState()) {

          on<RandomUserEventRequested>(_onRandomUserEventRequested);

    }
    final RandomUserRepository _randomUserRepository;

    void _onRandomUserEventRequested(
      RandomUserEventRequested event,
      Emitter<RandomUserState> emit,
    ) async {
      List<RandomUser> randomUsers = await _randomUserRepository.getRandomUsers();
      print("Fetched random user ${randomUsers}");
      return emit(
        RandomUserState._(
          status: RandomUserRequestStatus.loading,
          users: randomUsers,
        ),
      );
    }
  }




