import 'package:bloc_todo/blocs/random_user_bloc.dart';
import 'package:bloc_todo/pages/random_user_page.dart';
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
