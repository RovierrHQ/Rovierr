# Requirements Document

## Introduction

This document outlines the requirements for a social connection and real-time chat system for the Rovierr platform. The system enables students to discover other users, send connection requests, and engage in real-time messaging once connections are established. The feature is designed to be space-agnostic, appearing consistently across all spaces (Academic, Career, Campus Feed, etc.) to facilitate university-wide networking and collaboration.

## Glossary

- **Connection System**: The mechanism allowing users to send, accept, or reject connection requests to other users
- **Chat System**: The real-time messaging interface enabling connected users to communicate
- **People Page**: A dedicated interface displaying all registered users on the platform with search and filter capabilities
- **Connection Request**: An invitation sent from one user to another to establish a connection
- **Chat Drawer**: A slide-out panel component appearing from the right side of the screen displaying chat conversations
- **Centrifugo**: The real-time messaging infrastructure used for delivering messages instantly
- **Space-Agnostic**: Features that remain consistent and accessible across all application spaces (Academic, Career, etc.)
- **User Profile**: The public-facing information about a user including name, program, university, and bio

## Requirements

### Requirement 1

**User Story:** As a student, I want to discover other users on the platform, so that I can find potential study partners, friends, or collaborators.

#### Acceptance Criteria

1. WHEN a user navigates to the People Page THEN the system SHALL display a list of all registered users with their public profile information
2. WHEN displaying user profiles THEN the system SHALL show username, profile picture, university, program, and bio for each user
3. WHEN a user enters search text THEN the system SHALL filter the user list by name, username, university, or program in real-time
4. WHEN the user list exceeds 50 users THEN the system SHALL implement pagination with infinite scroll
5. WHEN a user views another user's profile THEN the system SHALL display the current connection status (not connected, pending, or connected)

### Requirement 2

**User Story:** As a student, I want to send connection requests to other users, so that I can build my network on the platform.

#### Acceptance Criteria

1. WHEN a user clicks the connect button on another user's profile THEN the system SHALL create a connection request and update the button state to "pending"
2. WHEN a connection request is sent THEN the system SHALL notify the recipient through the notification system
3. WHEN a user has already sent a connection request THEN the system SHALL prevent duplicate requests to the same user
4. WHEN a user attempts to connect with themselves THEN the system SHALL prevent the action and display an appropriate message
5. WHEN a connection request is created THEN the system SHALL store the request with sender ID, recipient ID, status, and timestamp

### Requirement 3

**User Story:** As a student, I want to receive and manage connection requests, so that I can control who I connect with on the platform.

#### Acceptance Criteria

1. WHEN a user receives a connection request THEN the system SHALL display the request in a dedicated notifications area
2. WHEN a user views a connection request THEN the system SHALL display the sender's profile information and action buttons (accept/reject)
3. WHEN a user accepts a connection request THEN the system SHALL create a bidirectional connection between both users and notify the sender
4. WHEN a user rejects a connection request THEN the system SHALL remove the request and allow the sender to send a new request after 30 days
5. WHEN a connection request is older than 90 days THEN the system SHALL automatically expire the request

### Requirement 4

**User Story:** As a student, I want to access the chat interface easily, so that I can quickly communicate with my connections.

#### Acceptance Criteria

1. WHEN a user clicks the chat icon in the navigation sidebar THEN the system SHALL open the chat drawer from the right side of the screen
2. WHEN the chat drawer opens THEN the system SHALL display a list of all connections with their online status and last message preview
3. WHEN a user clicks on a connection in the chat list THEN the system SHALL load the conversation history with that user
4. WHEN a user clicks outside the chat drawer THEN the system SHALL close the drawer and preserve the current conversation state
5. WHEN the chat drawer is open THEN the system SHALL remain accessible across all spaces without closing

### Requirement 5

**User Story:** As a student, I want to send and receive messages in real-time, so that I can have fluid conversations with my connections.

#### Acceptance Criteria

1. WHEN a user types a message and presses send THEN the system SHALL deliver the message to the recipient instantly via Centrifugo
2. WHEN a user receives a message THEN the system SHALL display the message in the conversation thread with sender name and timestamp
3. WHEN a message is sent THEN the system SHALL display a sending indicator until delivery confirmation is received
4. WHEN a message fails to send THEN the system SHALL display an error indicator and provide a retry option
5. WHEN a user is viewing a conversation THEN the system SHALL mark incoming messages as read automatically

### Requirement 6

**User Story:** As a student, I want to see when my connections are online, so that I know when they are available to chat.

#### Acceptance Criteria

1. WHEN a user opens the chat drawer THEN the system SHALL display online status indicators for all connections
2. WHEN a connection comes online THEN the system SHALL update their status indicator to "online" in real-time
3. WHEN a connection goes offline THEN the system SHALL update their status indicator to show last seen timestamp
4. WHEN a user is typing a message THEN the system SHALL broadcast a typing indicator to the recipient
5. WHEN a user stops typing for 3 seconds THEN the system SHALL remove the typing indicator

### Requirement 7

**User Story:** As a student, I want to search through my conversations, so that I can quickly find specific messages or contacts.

#### Acceptance Criteria

1. WHEN a user enters text in the chat search field THEN the system SHALL filter conversations by contact name or message content
2. WHEN search results are displayed THEN the system SHALL highlight matching text in conversation previews
3. WHEN a user clicks a search result THEN the system SHALL open that conversation and scroll to the matching message
4. WHEN the search field is cleared THEN the system SHALL restore the full conversation list
5. WHEN no matches are found THEN the system SHALL display a "no results" message

### Requirement 8

**User Story:** As a student, I want my message history to be preserved, so that I can reference past conversations.

#### Acceptance Criteria

1. WHEN a user opens a conversation THEN the system SHALL load the most recent 50 messages
2. WHEN a user scrolls to the top of a conversation THEN the system SHALL load the previous 50 messages automatically
3. WHEN messages are loaded THEN the system SHALL maintain the user's scroll position
4. WHEN a conversation has no more messages to load THEN the system SHALL display a "beginning of conversation" indicator
5. WHEN a user sends or receives a message THEN the system SHALL persist the message to the database immediately

### Requirement 9

**User Story:** As a student, I want to receive notifications for new messages, so that I don't miss important communications.

#### Acceptance Criteria

1. WHEN a user receives a message while the chat drawer is closed THEN the system SHALL display a notification badge on the chat icon
2. WHEN a user receives a message from a different conversation than the one currently open THEN the system SHALL increment the unread count for that conversation
3. WHEN a user opens a conversation with unread messages THEN the system SHALL clear the unread count for that conversation
4. WHEN a user receives a message THEN the system SHALL play a subtle notification sound (if enabled in settings)
5. WHEN the chat drawer is open and a new message arrives THEN the system SHALL update the conversation list order to show the most recent conversation first

### Requirement 10

**User Story:** As a system administrator, I want the chat system to scale efficiently, so that it can handle thousands of concurrent users.

#### Acceptance Criteria

1. WHEN the system processes messages THEN the system SHALL use Centrifugo for real-time delivery to minimize server load
2. WHEN a user connects to chat THEN the system SHALL establish a single WebSocket connection for all conversations
3. WHEN messages are stored THEN the system SHALL index conversations by user ID and timestamp for efficient retrieval
4. WHEN the system delivers messages THEN the system SHALL batch database writes to optimize performance
5. WHEN a user has more than 100 connections THEN the system SHALL paginate the connection list in the chat drawer

### Requirement 11

**User Story:** As a student, I want to manage my connections, so that I can remove connections I no longer wish to maintain.

#### Acceptance Criteria

1. WHEN a user views a connection's profile THEN the system SHALL display an option to remove the connection
2. WHEN a user removes a connection THEN the system SHALL delete the bidirectional connection and notify the other user
3. WHEN a connection is removed THEN the system SHALL preserve the message history but prevent new messages
4. WHEN a user attempts to message a removed connection THEN the system SHALL display a message indicating the connection has been removed
5. WHEN a connection is removed THEN the system SHALL allow both users to send new connection requests to each other

### Requirement 12

**User Story:** As a student, I want the People Page to be easily accessible, so that I can discover new connections at any time.

#### Acceptance Criteria

1. WHEN a user views the navigation sidebar THEN the system SHALL display a "People" navigation item above the user profile section
2. WHEN a user clicks the People navigation item THEN the system SHALL navigate to the People Page
3. WHEN the People Page loads THEN the system SHALL display within the main content area (not as a popover)
4. WHEN a user is on the People Page THEN the system SHALL highlight the People navigation item as active
5. WHEN a user navigates between spaces THEN the system SHALL maintain the People navigation item in the same position
