import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

// Placeholder for actual task data model
class Task {
  final String id;
  final String title;
  final String time;
  final String project;
  final String? categoryIconName; // Making this nullable for flexibility
  final Color? categoryIconColor; // Making this nullable
  final String type; // 'single-step' or 'multi-step'
  final double? progress; // For multi-step tasks
  final List<TaskStep>? steps; // For multi-step tasks

  Task({
    required this.id,
    required this.title,
    required this.time,
    required this.project,
    this.categoryIconName,
    this.categoryIconColor,
    required this.type,
    this.progress,
    this.steps,
  });
}

class TaskStep {
  final String id;
  final String title;
  final bool completed;

  TaskStep({required this.id, required this.title, required this.completed});
}


class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  // Dummy data similar to web app's getUpcomingTasks and getTasksForToday
  List<Task> get _upcomingTasks {
    return [
      Task(id: 'task1', title: 'Smith Script Write', time: '4:00 P.M. - 6:00 P.M.', project: 'Project 003', categoryIconName: 'skip_next', categoryIconColor: const Color(0xFF10B981), type: 'single-step'),
      Task(id: 'task2', title: 'Script App Development', time: '7:00 P.M. - 8:00 P.M.', project: 'Project 001', categoryIconName: 'code', categoryIconColor: const Color(0xFF10B981), type: 'multi-step', progress: 0.5, steps: [
          TaskStep(id: 'step2.1', title: 'Define core features', completed: true ),
          TaskStep(id: 'step2.2', title: 'Design database schema', completed: true ),
          TaskStep(id: 'step2.3', title: 'Develop API endpoints', completed: false ),
          TaskStep(id: 'step2.4', title: 'Frontend implementation', completed: false )
        ]),
      Task(id: 'task3', title: 'Video Editing', time: '9:00 P.M. - 10:00 P.M.', project: 'Project 006', categoryIconName: 'play_circle_filled', categoryIconColor: const Color(0xFF10B981), type: 'single-step'),
    ];
  }

  Map<String, dynamic> get _todayJourneyStats {
    return {
      'totalPlan': 12, // Example data
      'completed': 7,
      'nextDay': 2,
      'incomplete': 2,
      'cancelled': 1,
    };
  }


  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;
    final colorScheme = Theme.of(context).colorScheme;

    return ListView( // Use ListView for scrollability
      padding: const EdgeInsets.all(16.0),
      children: [
        // 1. Task Countdown Container (Placeholder)
        _buildTaskCountdownContainer(context, "Deep Work Session 1: Project Alpha", "1h 30m 05s"),
        const SizedBox(height: 24),

        // 2. Today Journey Stats
        _buildTodayJourneySection(context, textTheme, colorScheme),
        const SizedBox(height: 24),

        // 3. Upcoming Tasks
        _buildUpcomingTasksSection(context, textTheme, colorScheme),
      ],
    );
  }

  Widget _buildTaskCountdownContainer(BuildContext context, String taskName, String timeRemaining) {
    // This is a simplified version. The sticky behavior and dynamic updates
    // would require a more complex setup, possibly involving a Provider or lifting state.
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 12.0),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface, // --secondary-bg
        borderRadius: BorderRadius.circular(8.0),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              taskName,
              style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.w500, color: Theme.of(context).colorScheme.onSurface),
              overflow: TextOverflow.ellipsis,
            ),
          ),
          Text(
            timeRemaining,
            style: GoogleFonts.inter(fontSize: 14, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.primary), // --accent-green
          ),
        ],
      ),
    );
  }

  Widget _buildTodayJourneySection(BuildContext context, TextTheme textTheme, ColorScheme colorScheme) {
    final stats = _todayJourneyStats;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Today Journey',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600, fontSize: 18),
        ),
        const SizedBox(height: 16),
        Card(
          color: colorScheme.surface, // --secondary-bg or --card-bg
          elevation: 0, // Web version has box-shadow, Flutter Card has elevation
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)), // 0.75rem
          child: Padding(
            padding: const EdgeInsets.all(20.0), // 1.5rem approx
            child: Row(
              children: [
                // Stats Icon Section
                Column(
                  children: [
                    Icon(Icons.list_alt, size: 36, color: textTheme.titleSmall?.color), // stats-icon
                    const SizedBox(height: 8),
                    Text('Plan', style: textTheme.titleSmall?.copyWith(fontSize: 16)),
                    Text(
                      stats['totalPlan'].toString().padLeft(2, '0'),
                      style: textTheme.headlineMedium?.copyWith(
                        color: colorScheme.primary, // --accent-green
                        fontWeight: FontWeight.w700,
                        fontSize: 48, // Adjusted from 3.75rem
                      ),
                    ),
                  ],
                ),
                const SizedBox(width: 20),
                const VerticalDivider(width: 1, thickness: 1), // Not exactly like web, but a separator
                const SizedBox(width: 20),
                // Stats Details
                Expanded(
                  child: Column(
                    children: [
                      _buildStatsRow(context, Icons.check_circle, 'Complete', stats['completed'].toString().padLeft(2, '0'), colorScheme.primary, colorScheme.primary.withOpacity(0.8)),
                      _buildStatsRow(context, Icons.skip_next, 'Next Day', stats['nextDay'].toString().padLeft(2, '0'), colorScheme.secondary, colorScheme.secondary.withOpacity(0.8)),
                      _buildStatsRow(context, Icons.error_outline, 'Incomplete', stats['incomplete'].toString().padLeft(2, '0'), colorScheme.error, colorScheme.error.withOpacity(0.8)),
                      _buildStatsRow(context, Icons.delete_outline, 'Cancel', stats['cancelled'].toString().padLeft(2, '0'), textTheme.titleSmall?.color ?? Colors.grey, (textTheme.titleSmall?.color ?? Colors.grey).withOpacity(0.8)),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildStatsRow(BuildContext context, IconData icon, String label, String value, Color iconColor, Color badgeColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Icon(icon, size: 20, color: iconColor),
              const SizedBox(width: 8),
              Text(label, style: Theme.of(context).textTheme.bodyMedium?.copyWith(fontSize: 14)),
            ],
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: badgeColor,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              value,
              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.onPrimary, // Assuming badge text is dark on light badge
                fontSize: 12,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingTasksSection(BuildContext context, TextTheme textTheme, ColorScheme colorScheme) {
    final tasks = _upcomingTasks;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Upcoming Tasks',
          style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600, fontSize: 18),
        ),
        const SizedBox(height: 16),
        ListView.builder(
          shrinkWrap: true, // Important for ListView inside ListView
          physics: const NeverScrollableScrollPhysics(), // Disable scrolling for this inner list
          itemCount: tasks.length,
          itemBuilder: (context, index) {
            return _buildTaskCard(context, tasks[index], textTheme, colorScheme);
          },
        ),
      ],
    );
  }

  Widget _buildTaskCard(BuildContext context, Task task, TextTheme textTheme, ColorScheme colorScheme) {
    IconData _getIconData(String? iconName) {
        // Mapping from string names (used in web) to Material IconData
        // This will need to be expanded based on all icons used.
        switch (iconName) {
            case 'skip_next': return Icons.skip_next;
            case 'code': return Icons.code;
            case 'play_circle_filled': return Icons.play_circle_filled;
            case 'videocam': return Icons.videocam;
            // Add more cases as needed
            default: return Icons.task_alt; // Default icon
        }
    }

    return Card(
      color: colorScheme.surface, // --secondary-bg
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12.0), // 0.75rem
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12.0)),
      child: Padding(
        padding: const EdgeInsets.all(16.0), // 1rem
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Text(
                    task.title,
                    style: textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w600, fontSize: 16), // task-title
                  ),
                ),
                if (task.categoryIconName != null)
                  Icon(_getIconData(task.categoryIconName), color: task.categoryIconColor ?? colorScheme.primary, size: 24),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(task.time, style: textTheme.titleSmall?.copyWith(fontSize: 12.25)), // 0.875rem
                Text(task.project, style: textTheme.titleSmall?.copyWith(fontSize: 12.25)),
              ],
            ),
            if (task.type == 'multi-step' && task.steps != null) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: task.progress ?? 0,
                      backgroundColor: colorScheme.onSurface.withOpacity(0.1), // --border-color
                      valueColor: AlwaysStoppedAnimation<Color>(colorScheme.primary), // --accent-green
                      minHeight: 8, // progress-bar-container height
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '${task.steps!.where((s) => s.completed).length}/${task.steps!.length}',
                    style: textTheme.titleSmall?.copyWith(fontSize: 11.2), // 0.8rem
                  ),
                ],
              ),
              const SizedBox(height: 8),
              TextButton(
                style: TextButton.styleFrom(
                  padding: EdgeInsets.zero,
                  alignment: Alignment.centerLeft,
                ),
                onPressed: () { /* Handle view steps */ },
                child: Text(
                  'View Steps',
                  style: textTheme.titleSmall?.copyWith(color: colorScheme.secondary, fontSize: 11.2), // --accent-yellow
                ),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
