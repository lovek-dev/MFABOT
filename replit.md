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

## Running the Bot
```bash
node index.js
```

## Recent Changes
- Added auto-responder system with /respond, /listresponses, /removeresponse commands
- Added scheduled embed messages with /schedule, /listschedules, /cancelschedule commands
- Added data storage for responses and schedules in data/ folder
- Scheduler runs every 30 seconds to check and send due messages
- Converted all CommonJS files to ES Modules for consistency
- Fixed duplicate command names (moderation.js renamed to `mod`)
- Updated token handling to use environment variables
- Fixed config property mismatches in buttonHandler
- Added claimRoles array to config
- Fixed button handler customId mismatches
