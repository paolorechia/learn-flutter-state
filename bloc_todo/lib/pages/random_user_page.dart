import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:bloc_todo/models/random_user.dart';

import 'package:bloc_todo/blocs/authentication_bloc.dart';
import 'package:bloc_todo/blocs/random_user_bloc.dart';
import 'package:bloc_todo/blocs/navigation_bloc.dart';

class RandomUserPage extends StatelessWidget {
  const RandomUserPage({super.key});

  static Route<void> route() {
    return MaterialPageRoute<void>(builder: (_) => RandomUserPage());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Random User Page'),
        actions: [
          IconButton(
            icon: Icon(Icons.numbers),
            onPressed: () => context.read<NavigationBloc>().add(
              NavigationEventGoToCounter(),
            ),
          ),
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () =>
                context.read<AuthenticationBloc>().add(SignOutEvent()),
          ),
        ],
      ),
      body: BlocBuilder<RandomUserBloc, RandomUserState>(
        builder: (context, state) {
          List<Widget> children = [];

          if (state.status == RandomUserRequestStatus.loading) {
            children.add(Text('Loading...'));
          } else {
            children.add(
              ElevatedButton(
                child: Text('Load users'),
                onPressed: () => context.read<RandomUserBloc>().add(
                  RandomUserEventRequested(),
                ),
              ),
            );
          }

          if (state.status == RandomUserRequestStatus.success) {
            children.add(Text('Success!'));
          }

          if (state.status == RandomUserRequestStatus.failure) {
            children.add(Text('Failure!'));
          }

          if (state.users.isNotEmpty) {
            for (RandomUser user in state.users) {
              children.add(Text(user.email));
            }
          }

          return Center(child: Column(children: children));
        },
      ),
    );
  }
}
