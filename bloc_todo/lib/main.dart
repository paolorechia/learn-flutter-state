import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'counter_page.dart';
import 'counter_cubit.dart';
import 'simple_bloc_observer.dart';
import 'counter_bloc.dart';

void main() async {
  Bloc.observer = SimpleBlocObserver();

  CounterCubit(0)
    ..increment()
    ..increment()
    ..close();


  CounterBloc()
    ..add(CounterIncrementPressed())
    ..add(CounterIncrementPressed())
    ..close();

  runApp(CounterApp());
}

class CounterApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: BlocProvider(
        create: (_) => CounterBloc(),
        child: CounterPage(),
      ),
    );
  }
}