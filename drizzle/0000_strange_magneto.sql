CREATE TABLE `history` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`at` text NOT NULL,
	`actor` text NOT NULL,
	`description` text NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `history_lead` ON `history` (`lead_id`);--> statement-breakpoint
CREATE TABLE `leads` (
	`id` text PRIMARY KEY NOT NULL,
	`request_key` text NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text DEFAULT '' NOT NULL,
	`city` text NOT NULL,
	`postcode` text NOT NULL,
	`segment` text NOT NULL,
	`payload` text NOT NULL,
	`source` text NOT NULL,
	`campaign` text DEFAULT '' NOT NULL,
	`stage` text DEFAULT 'nouveau' NOT NULL,
	`assignee` text DEFAULT 'Kevin' NOT NULL,
	`next_action` text DEFAULT 'Qualifier la demande' NOT NULL,
	`due_at` text NOT NULL,
	`notes` text DEFAULT '' NOT NULL,
	`checks` text DEFAULT '{}' NOT NULL,
	`marketing` integer DEFAULT 0 NOT NULL,
	`stopped` integer DEFAULT 0 NOT NULL,
	`version` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `leads_request_key_unique` ON `leads` (`request_key`);--> statement-breakpoint
CREATE INDEX `leads_email_created` ON `leads` (`email`,`created_at`);--> statement-breakpoint
CREATE INDEX `leads_due` ON `leads` (`due_at`);