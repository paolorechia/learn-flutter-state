import 'package:bloc_todo/blocs/navigation_bloc.dart';

import 'package:bloc_todo/pages/random_user_page.dart';
import 'package:bloc_todo/pages/counter_page.dart';

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

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
        return BlocListener<NavigationBloc, NavigationState>(
          listener: (context, state) {
            if (state.location == NavigationLocation.counter) {
              _navigator.pushAndRemoveUntil<void>(
                CounterPage.route(),
                (route) => false,
              );
              return;
            } else if (state.location == NavigationLocation.randomUsers) {
              _navigator.pushAndRemoveUntil<void>(
                RandomUserPage.route(),
                (route) => false,
              );
              return;
            }
          },
          child: child,
        );
      },
      onGenerateRoute: (_) => RandomUserPage.route(),
    );
  }
}
