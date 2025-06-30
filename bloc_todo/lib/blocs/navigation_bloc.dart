import 'package:equatable/equatable.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:bloc_concurrency/bloc_concurrency.dart';

// events
sealed class NavigationEvent {}

final class NavigationEventGoToCounter extends NavigationEvent {}

final class NavigationEventGoToRandomUsers extends NavigationEvent {}

enum NavigationLocation { counter, randomUsers }

// state
class NavigationState extends Equatable {
  final NavigationLocation location;

  const NavigationState._({required this.location});

  const NavigationState(NavigationLocation location)
    : this._(location: location);

  @override
  List<Object> get props => [location];
}

// bloc
class NavigationBloc extends Bloc<NavigationEvent, NavigationState> {
  NavigationBloc() : super(const NavigationState(NavigationLocation.counter)) {
    on<NavigationEventGoToCounter>(
      _onNavigateToCounter,
      transformer: restartable(),
    );
    on<NavigationEventGoToRandomUsers>(
      _onNavigateToRandomUsers,
      transformer: restartable(),
    );
  }

  void _onNavigateToCounter(
    NavigationEventGoToCounter event,
    Emitter<NavigationState> emit,
  ) async {
    emit(NavigationState(NavigationLocation.counter));
  }

  void _onNavigateToRandomUsers(
    NavigationEventGoToRandomUsers event,
    Emitter<NavigationState> emit,
  ) async {
    emit(NavigationState(NavigationLocation.randomUsers));
  }
}
