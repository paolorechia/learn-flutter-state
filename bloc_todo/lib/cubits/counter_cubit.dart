import 'package:flutter_bloc/flutter_bloc.dart';

class CounterCubit extends Cubit<int> {
  CounterCubit(int initialState) : super(initialState);

  void increment() {
    addError(Exception('increment error!'), StackTrace.current);
    emit(state + 1);
  }
}
