/**
 * @file Shared types of the application: the data model stored in the Firebase Realtime Database
 * (see the project scoping document) and the models used by the interface.
 */

declare module "#app" {
	/** Custom route metadata read by the global auth middleware. */
	interface PageMeta {
		/** Roles allowed to open the page; any signed-in user can open it when omitted. */
		roles?: Role[];
	}
}

/** Access level of a user account. */
export type Role = "collaborator" | "technician" | "manager" | "admin";

/** Lifecycle step of a ticket, from creation to closure. */
export type TicketStatus = "new" | "in_progress" | "resolved" | "closed";

/** Urgency level of a ticket. */
export type TicketPriority = "low" | "medium" | "high" | "urgent";

/** Profile of a user account, stored under `users/<id>`. */
export interface UserProfile {
	/** Firebase Auth uid, which is also the key of the profile node. */
	id: string;
	/** Full name shown in the interface. */
	displayName: string;
	/** E-mail address used to sign in. */
	email: string;
	/** Access level of the account. */
	role: Role;
	/** Whether the account can be used; the auth middleware signs inactive users out. */
	active: boolean;
}

/** Ticket category, stored under `categories/<id>`. */
export interface Category {
	/** Firebase push key. */
	id: string;
	/** Name shown in the interface. */
	name: string;
	/** Whether the category is offered on new tickets; existing tickets keep it either way. */
	active: boolean;
}

/** Support request, stored under `tickets/<id>`. */
export interface Ticket {
	/** Firebase push key. */
	id: string;
	/** Short summary of the incident. */
	title: string;
	/** Detailed description, in plain text. */
	description: string;
	/** Id of the ticket category. */
	categoryId: string;
	/** Category name, copied onto the ticket at creation. */
	categoryName: string;
	/** Urgency level. */
	priority: TicketPriority;
	/** Current lifecycle step. */
	status: TicketStatus;
	/** Id of the user who reported the incident. */
	authorId: string;
	/** Display name of the author, copied onto the ticket at creation. */
	authorName: string;
	/** Id of the assigned technician, or `null` while unassigned. */
	assigneeId: string | null;
	/** Display name of the assigned technician, or `null` while unassigned. */
	assigneeName: string | null;
	/** Creation time, set by the server. */
	createdAt: Date;
	/** Time of the last change, set by the server. */
	updatedAt: Date;
	/** Time of the move from `new` to `in_progress`, or `null` before it happens. */
	firstResponseAt: Date | null;
	/** Time of closure, or `null` while the ticket is not closed. */
	closedAt: Date | null;
	/** Time the ticket was last marked as resolved, kept if it is reopened; `null` if it never was. */
	resolvedAt: Date | null;
	/** Readable number such as `RES-0042`; absent from tickets created before numbering existed. */
	number?: string;
}

/** Values emitted by the ticket creation form. */
export type TicketFormData = {
	/** Trimmed title. */
	title: string;
	/** Id of the selected category. */
	categoryId: string;
	/** Selected priority. */
	priority: TicketPriority;
	/** Trimmed description. */
	description: string;
	/** Files selected by the user. */
	attachments: File[];
};

/** Criteria of the ticket list filters; an empty string disables a criterion. */
export interface TicketFilterValues {
	/** Text searched in the title, id and number of the tickets. */
	search: string;
	/** Exact status to match. */
	status: TicketStatus | "";
	/** Exact priority to match. */
	priority: TicketPriority | "";
	/** Id of the category to match. */
	categoryId: string;
}

/** Comment posted on a ticket, stored under `comments/<ticketId>/<id>`. */
export interface TicketComment {
	/** Firebase push key. */
	id: string;
	/** Id of the commented ticket. */
	ticketId: string;
	/** Id of the comment author. */
	authorId: string;
	/** Display name of the comment author. */
	authorName: string;
	/** Comment text, in plain text. */
	body: string;
	/** Publication time, set by the server. */
	createdAt: Date;
}

/** Fields shared by all history entries. */
interface HistoryBase {
	/** Firebase push key, or `created-<ticketId>` for a rebuilt creation entry. */
	id: string;
	/** Id of the ticket concerned. */
	ticketId: string;
	/** Set when the entry is displayed outside its ticket (activity feed). */
	ticketTitle?: string;
	/** Display name of the user who made the change. */
	actorName: string;
	/** Time of the change. */
	createdAt: Date;
}

/**
 * Traced change of a ticket, stored under `history/<ticketId>/<id>`.
 * `created` entries are never stored: the analytics page rebuilds them from the tickets.
 * For `assignment`, `from` and `to` hold technician display names.
 */
export type HistoryEntry = HistoryBase &
	(
		| { type: "created" }
		| { type: "status"; from: TicketStatus; to: TicketStatus }
		| { type: "priority"; from: TicketPriority; to: TicketPriority }
		| { type: "assignment"; from: string | null; to: string }
	);

// Interface

/** Names of the icons drawn by the `AppIcon` component. */
export type IconName =
	| "dashboard"
	| "ticket"
	| "chart"
	| "users"
	| "tag"
	| "plus"
	| "logout"
	| "menu"
	| "bell"
	| "trash";

/** Link of the main navigation. */
export interface NavItem {
	/** Text of the link. */
	label: string;
	/** Target route. */
	to: string;
	/** Icon shown next to the text. */
	icon: IconName;
	/** Roles allowed to see the link; everyone sees it when omitted. */
	roles?: Role[];
}

/** Step of a breadcrumb trail. */
export interface Breadcrumb {
	/** Text of the step. */
	label: string;
	/** Target route; omitted for the current page. */
	to?: string;
}

/** Indicator displayed by the `UiStatCard` component. */
export interface StatItem {
	/** Name of the indicator. */
	label: string;
	/** Value, already formatted when it is a string. */
	value: number | string;
	/** Optional detail shown under the value. */
	hint?: string;
}

/** Row displayed by the `UiBarList` component. */
export interface BarItem {
	/** Name of the row. */
	label: string;
	/** Value represented by the bar. */
	value: number;
}

/** Status change offered to the user as a button. */
export interface StatusTransition {
	/** Status reached by the transition. */
	to: TicketStatus;
	/** Text of the button. */
	label: string;
}

/** Validation messages displayed by the ticket form, by field. */
export type TicketFormErrors = Partial<
	Record<
		"title" | "description" | "categoryId" | "priority" | "attachment",
		string
	>
>;

/** Notification built from a ticket comment or history entry. */
export type AppNotification = {
  /** Source id with its origin as a prefix: `comment-<id>` or `history-<id>`. */
  id: string
  /** Id of the ticket concerned. */
  ticketId: string
  /** Heading of the notification. */
  title: string
  /** Text of the notification. */
  message: string
  /** Time of the event, in milliseconds since the epoch. */
  createdAt: number
}