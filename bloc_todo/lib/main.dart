// Library imports
import 'package:bloc_todo/blocs/authentication_bloc.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

// Repositories
import 'repositories/random_users.dart';
import 'repositories/authentication.dart';

// Blocs
import 'blocs/counter_bloc.dart';
import 'blocs/random_user_bloc.dart';
import 'blocs/navigation_bloc.dart';

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
      home: MultiRepositoryProvider(
        providers: [
          RepositoryProvider(
            create: (_) => RandomUserRepository(),
            dispose: (repository) => repository.dispose(),
          ),
          RepositoryProvider(
            create: (context) => AuthenticationRepository(),
            dispose: (repository) => repository.dispose(),
          ),
        ],
        child: MultiBlocProvider(
          providers: [
            BlocProvider<CounterBloc>(create: (context) => CounterBloc()),
            BlocProvider<RandomUserBloc>(
              create: (context) => RandomUserBloc(
                randomUserRepository: context.read<RandomUserRepository>(),
              ),
            ),
            BlocProvider<NavigationBloc>(create: (context) => NavigationBloc()),
            BlocProvider<AuthenticationBloc>(
              create: (context) => AuthenticationBloc(
                authenticationRepository: context
                    .read<AuthenticationRepository>(),
              ),
            ),
          ],
          child: const AppView(),
        ),
      ),
    );
  }
}
