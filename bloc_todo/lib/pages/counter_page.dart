import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'package:bloc_todo/blocs/authentication_bloc.dart';
import 'package:bloc_todo/blocs/navigation_bloc.dart';
import 'package:bloc_todo/blocs/counter_bloc.dart';

class CounterPage extends StatelessWidget {
  const CounterPage({super.key});

  static Route<void> route() {
    return MaterialPageRoute<void>(builder: (_) => CounterPage());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Counter'),
        actions: [
          IconButton(
            icon: Icon(Icons.verified_user),
            onPressed: () => context.read<NavigationBloc>().add(
              NavigationEventGoToRandomUsers(),
            ),
          ),
          IconButton(
            icon: Icon(Icons.logout),
            onPressed: () =>
                context.read<AuthenticationBloc>().add(SignOutEvent()),
          ),
        ],
      ),
      body: BlocBuilder<CounterBloc, int>(
        builder: (context, count) {
          return Center(
            child: Text('$count', style: TextStyle(fontSize: 24.0)),
          );
        },
      ),
      floatingActionButton: Column(
        crossAxisAlignment: CrossAxisAlignment.end,
        mainAxisAlignment: MainAxisAlignment.end,
        children: <Widget>[
          Padding(
            padding: EdgeInsets.symmetric(vertical: 5.0),
            child: FloatingActionButton(
              child: Icon(Icons.add),
              onPressed: () =>
                  context.read<CounterBloc>().add(CounterIncrementPressed()),
            ),
          ),
        ],
      ),
    );
  }
}
