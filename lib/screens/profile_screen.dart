import 'package:flutter/material.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Placeholder content for Profile Screen
    return Scaffold(
      // appBar: AppBar(
      //   title: const Text('Profile'),
      //   backgroundColor: Theme.of(context).colorScheme.surface,
      //   automaticallyImplyLeading: false,
      // ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'User Profile',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(color: Colors.white),
            ),
            const SizedBox(height: 20),
            ListTile(
              leading: const Icon(Icons.person, color: Colors.white70),
              title: Text('Username', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.white)),
              subtitle: Text('user@example.com', style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.white70)),
            ),
            ListTile(
              leading: const Icon(Icons.settings, color: Colors.white70),
              title: Text('Settings', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.white)),
              onTap: () {
                // Navigate to settings page or show settings options
              },
            ),
            ListTile(
              leading: const Icon(Icons.logout, color: Colors.white70),
              title: Text('Logout', style: Theme.of(context).textTheme.bodyLarge?.copyWith(color: Colors.white)),
              onTap: () {
                // Handle logout
              },
            ),
          ],
        ),
      ),
    );
  }
}
