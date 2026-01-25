# MFA Discord Bot

## Overview
A feature-rich Discord moderation bot with prefix commands, slash commands, and interactive button handlers for server management.

## Project Structure
```
├── index.js                 # Main bot entry point
├── deploy.js                # Slash command registration script
├── config.json              # Bot configuration (non-sensitive settings)
├── commands/
│   ├── prefix/              # Prefix-based commands (+command)
│   │   ├── ban.js           # Ban a user
│   │   ├── kick.js          # Kick a user
│   │   ├── timeout.js       # Timeout a user
│   │   ├── unban.js         # Unban a user
│   │   ├── moderation.js    # Moderation command with logging
│   │   ├── dmrole.js        # DM all members of a role
│   │   ├── embed.js         # Send an embed message
│   │   ├── say.js           # Make bot say something
│   │   ├── send.js          # Send text or embed
│   │   └── setrole.js       # Set allowed role for bot commands
│   └── slash/               # Slash commands (/command)
│       ├── kick.js          # Kick a user
│       ├── timeout.js       # Timeout a user
│       ├── unban.js         # Unban a user
│       ├── moderation.js    # Moderation command with logging
│       ├── dmrole.js        # DM all members of a role
│       ├── send.js          # Send text or embed
│       ├── setrole.js       # Set allowed role for bot commands
│       ├── setup.js         # Create welcome panel with rules
│       ├── respond.js       # Set auto-responses for trigger words
│       ├── listresponses.js # List all auto-responses
│       ├── removeresponse.js# Remove an auto-response
│       ├── schedule.js      # Schedule embed messages
│       ├── listschedules.js # List scheduled messages
│       └── cancelschedule.js# Cancel a scheduled message
├── data/                    # Data storage
│   ├── responses.json       # Auto-response storage
│   └── schedules.json       # Scheduled messages storage
├── buttons/                 # Button interaction handlers
│   ├── acceptRules.js       # Accept rules button handler
│   ├── claimRole.js         # Claim roles button handler
│   └── showRules.js         # Show rules button handler
├── interactions/
│   └── buttonHandler.js     # Central button interaction router
├── utils/
│   ├── logger.js            # Action logging utility
│   └── permissions.js       # Permission checking utilities
└── handlers/
    ├── commandHandler.js    # Command loading handler
    └── slashHandler.js      # Slash command handler
```

## Environment Variables Required
- `DISCORD_BOT_TOKEN` - Your Discord bot token (required)
- `DISCORD_APPLICATION_ID` - Your Discord application ID (required for deploying slash commands)

## Configuration (config.json)
The `config.json` file contains non-sensitive configuration:
- `prefix`: Command prefix (default: `+`)
- `logChannelId`: Channel ID for logging actions
- `allowedRoleId`: Role ID that can use moderation commands
- `verifyRoleId`: Role given when users accept rules
- `ownerId`: Bot owner's Discord user ID
- `welcomeImage`: URL for welcome panel image
- `welcomeMessage`: Welcome panel message text
- `rulesMessage`: Server rules text
- `claimRoles`: Array of claimable roles `[{ "id": "roleId", "label": "Role Name" }]`

## Commands

### Prefix Commands (use with `+` prefix)
- `+ban @user [reason]` - Ban a user
- `+kick @user` - Kick a user
- `+timeout @user [ms]` - Timeout a user for specified milliseconds
- `+unban [userId]` - Unban a user by ID
- `+mod @user` - Kick with logging
- `+dmrole @role [message]` - DM all members of a role
- `+embed [title] [description]` - Send an embed
- `+say [message]` - Make the bot say something
- `+send [embed] [title] [description]` - Send text or embed
- `+setrole @role` - Set the allowed role for bot commands

### Slash Commands
- `/kick user:` - Kick a user
- `/timeout user: ms:` - Timeout a user
- `/unban id:` - Unban by user ID
- `/mod user:` - Kick with logging
- `/dmrole role: message:` - DM all role members
- `/send` - Send text or embed
- `/setrole role:` - Set allowed role
- `/setup` - Create welcome panel with rules and buttons

### Auto-Responder Commands
- `/respond trigger: reply:` - Set an auto-response (when someone says the trigger word, bot replies)
- `/listresponses` - View all configured auto-responses
- `/removeresponse trigger:` - Remove an auto-response

### Scheduled Messages Commands
- `/schedule channel: date: time: title: description: [color:]` - Schedule an embed message
  - Date format: YYYY-MM-DD (e.g., 2024-12-25)
  - Time format: HH:MM in 24-hour format (e.g., 14:30)
  - Color: hex code (#FF5733) or name (red, blue, green, etc.)
- `/listschedules` - View all scheduled messages
- `/cancelschedule id:` - Cancel a scheduled message

## Deploying Slash Commands
To register slash commands with Discord:
```bash
node deploy.js
```
Requires `DISCORD_BOT_TOKEN` and `DISCORD_APPLICATION_ID` environment variables.

## Admin Commands Guide

These commands are restricted to server Administrators.

### Moderation & Management
- `/kick user: [reason:]` - Kick a user from the server.
- `/timeout user: duration: [reason:]` - Timeout a user for a specific duration (in seconds).
- `/unban id: [reason:]` - Unban a user using their Discord ID.
- `/mod user:` - Special moderation command with enhanced logging.
- `/setrole role:` - Configure which role is allowed to use bot commands.
- `/roleset ign_role: rules_role:` - Configure the roles given for IGN setting and Rule acceptance.
- `/dmrole role: message:` - Send a DM to every member who has a specific role.

### Bounty System (Admin Only)
- `/requestchannel channel:` - Set the channel where user bounty requests are sent for admin approval.
- `/bountychannel channel:` - Set the public channel where approved bounties are posted.
- `/bountyrole role:` - Set the role to be pinged when a bounty is posted.
- `/bountyclear [ign:]` - Clear all active bounties, or a specific one if an IGN is provided.
- **Approval System**: Admin buttons (✅ Accept / ❌ Deny) will appear in the request channel. 
  - Denying a bounty sends a DM warning to the requester.

### Server Setup & Utility
- `/setup` - Create the welcome panel with rules and role-claim buttons.
- `/setupedit [image:] [message:]` - Edit the welcome panel's appearance.
- `/guidemsg message:` - Update the server guide text.
- `/absentchannel channel:` - Set the channel for absence reports.
- `/absentlist` - View all members currently on leave.
- `/clearabsent user:` - Manually clear a user's absence status.
- `/teamchannel channel:` - Set the channel for the live team roster.
- `/teamadd ign:` - Add a player's IGN to the team list (Admin only).
- `/teamaddmessage message:` - Set the custom message when a team member is added (use {ign}).
- `/teamremove ign:` - Remove a player's IGN from the team list (Admin only).
- `/kos ign:` - Add an IGN to the Kill On Sight list (Admin only).
- `/warlog result: notes:` - Log a clan war outcome.

### Embed Templates
- `/embed template:` - Post a pre-saved 3-column embed.
- `/embededit name: [title:] [col1:] [col2:] [col3:]` - Create or edit an embed template.

## Running the Bot
```bash
npm start
```

The bot runs on port 5000 with an Express health check server. In Replit, the server binds to `0.0.0.0:5000`.

## Recent Changes
- Implemented per-guild data isolation for all features (Teams, War Logs, Promotions, Auto-responses, Schedules, IGNs)
- Redesigned /promote and /demote with professional embed formats
- Fixed /teamremove to notify specific channels
- Updated /respond and /schedule to prevent cross-server interference
