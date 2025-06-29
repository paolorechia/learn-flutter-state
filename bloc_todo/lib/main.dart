// Library imports
import 'package:bloc_todo/pages/random_user_page.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';


// Repositories
import 'repositories/random_users.dart';

// Blocs
import 'blocs/counter_bloc.dart';
import 'blocs/random_user_bloc.dart';

// Pages
import 'pages/counter_page.dart';

// Observers
import 'observers/simple_bloc_observer.dart';

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


class AppView extends StatefulWidget {
  const AppView({super.key});

  @override
  State<AppView> createState() => _AppViewState();
}

class _AppViewState extends State<AppView> {
  final _navigatorKey = GlobalKey<NavigatorState>();

  NavigatorState get _navigator => _navigatorKey.currentState!;


  @override
  Widget build(BuildContext context) { 
    return MaterialApp(
      navigatorKey: _navigatorKey,
      builder: (context, child) {
        return BlocListener<RandomUserBloc, RandomUserState>(
          listener:(context, state) {
            // _navigator.pushAndRemoveUntil<void>(
            //   RandomUserPage.route(),
            //   (route) => false,
            // );
          },
          child: child,
        );
      },
      onGenerateRoute: (_) => RandomUserPage.route(),
    );
  }
}
