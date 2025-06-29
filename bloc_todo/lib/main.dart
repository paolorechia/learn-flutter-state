// Library imports
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// Repositories
import 'repositories/random_users.dart';

// Blocs
import 'blocs/counter_bloc.dart';
import 'blocs/random_user_bloc.dart';

// Observers
import 'observers/simple_bloc_observer.dart';

// Navigation
import 'navigation/app_view.dart';

void main() async {
  Bloc.observer = SimpleBlocObserver();

  runApp(BlocTodoApp());
}

class BlocTodoApp extends StatelessWidget {
  const BlocTodoApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      home: RepositoryProvider(
          create: (_) => RandomUserRepository(),
          dispose: (repository) => repository.dispose(),
          child: MultiBlocProvider(
            providers: [
              BlocProvider<CounterBloc>(
                create: (context) => CounterBloc(),
              ),
              BlocProvider<RandomUserBloc>(
                create: (context) => RandomUserBloc(
                  randomUserRepository: context.read<RandomUserRepository>()
                ),
              ),
            ],
            child: const AppView(),
          ),
      ),
    );
  }
}

