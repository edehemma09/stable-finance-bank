export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          account_number: string
          available_balance: number
          balance: number
          created_at: string
          currency: string
          id: string
          interest_rate: number | null
          metadata: Json
          nickname: string | null
          opened_at: string
          routing_number: string
          status: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_number: string
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          interest_rate?: number | null
          metadata?: Json
          nickname?: string | null
          opened_at?: string
          routing_number?: string
          status?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_number?: string
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          interest_rate?: number | null
          metadata?: Json
          nickname?: string | null
          opened_at?: string
          routing_number?: string
          status?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind: string
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      alerts_prefs: {
        Row: {
          large_txn_threshold: number
          login_alerts: boolean
          low_balance_threshold: number
          updated_at: string
          user_id: string
        }
        Insert: {
          large_txn_threshold?: number
          login_alerts?: boolean
          low_balance_threshold?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          large_txn_threshold?: number
          login_alerts?: boolean
          low_balance_threshold?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string | null
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string | null
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      bill_payments: {
        Row: {
          amount: number
          created_at: string
          from_account_id: string
          id: string
          memo: string | null
          payee_id: string
          scheduled_for: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_account_id: string
          id?: string
          memo?: string | null
          payee_id: string
          scheduled_for?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_account_id?: string
          id?: string
          memo?: string | null
          payee_id?: string
          scheduled_for?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bill_payments_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bill_payments_payee_id_fkey"
            columns: ["payee_id"]
            isOneToOne: false
            referencedRelation: "payees"
            referencedColumns: ["id"]
          },
        ]
      }
      cards: {
        Row: {
          account_id: string
          brand: string
          card_type: string
          cardholder_name: string
          contactless_enabled: boolean
          created_at: string
          cvv: string
          daily_limit: number | null
          exp_month: number
          exp_year: number
          full_pan: string
          id: string
          international_enabled: boolean
          last4: string
          network: string
          online_enabled: boolean
          pan_masked: string
          status: string
          user_id: string
        }
        Insert: {
          account_id: string
          brand?: string
          card_type: string
          cardholder_name: string
          contactless_enabled?: boolean
          created_at?: string
          cvv: string
          daily_limit?: number | null
          exp_month: number
          exp_year: number
          full_pan: string
          id?: string
          international_enabled?: boolean
          last4: string
          network?: string
          online_enabled?: boolean
          pan_masked: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string
          brand?: string
          card_type?: string
          cardholder_name?: string
          contactless_enabled?: boolean
          created_at?: string
          cvv?: string
          daily_limit?: number | null
          exp_month?: number
          exp_year?: number
          full_pan?: string
          id?: string
          international_enabled?: boolean
          last4?: string
          network?: string
          online_enabled?: boolean
          pan_masked?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cards_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      cheque_deposits: {
        Row: {
          account_id: string
          admin_notes: string | null
          amount: number
          back_url: string | null
          created_at: string
          decided_at: string | null
          front_url: string | null
          id: string
          status: string
          user_id: string
        }
        Insert: {
          account_id: string
          admin_notes?: string | null
          amount: number
          back_url?: string | null
          created_at?: string
          decided_at?: string | null
          front_url?: string | null
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          account_id?: string
          admin_notes?: string | null
          amount?: number
          back_url?: string | null
          created_at?: string
          decided_at?: string | null
          front_url?: string | null
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cheque_deposits_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      deleted_users: {
        Row: {
          deleted_at: string
          deleted_by: string | null
          email: string | null
          full_name: string | null
          id: string
          snapshot: Json
          user_id: string
          username: string | null
        }
        Insert: {
          deleted_at?: string
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          snapshot?: Json
          user_id: string
          username?: string | null
        }
        Update: {
          deleted_at?: string
          deleted_by?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          snapshot?: Json
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          status: string
          subject: string
          template: string | null
          to_email: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          subject: string
          template?: string | null
          to_email: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          status?: string
          subject?: string
          template?: string | null
          to_email?: string
        }
        Relationships: []
      }
      error_events: {
        Row: {
          action: string | null
          action_approved_at: string | null
          action_approved_by: string | null
          action_executed_at: string | null
          ai_action_kind: string | null
          ai_cause: string | null
          ai_confidence: string | null
          ai_error: string | null
          ai_recommendation: string | null
          ai_status: string
          analyzed_at: string | null
          created_at: string
          fingerprint: string
          first_seen_at: string
          id: string
          incident_code: string
          last_seen_at: string
          message: string
          metadata: Json
          occurrence_count: number
          resolved_at: string | null
          resolved_by: string | null
          route: string | null
          severity: string
          source: string
          stack_summary: string | null
          status: string
          updated_at: string
        }
        Insert: {
          action?: string | null
          action_approved_at?: string | null
          action_approved_by?: string | null
          action_executed_at?: string | null
          ai_action_kind?: string | null
          ai_cause?: string | null
          ai_confidence?: string | null
          ai_error?: string | null
          ai_recommendation?: string | null
          ai_status?: string
          analyzed_at?: string | null
          created_at?: string
          fingerprint: string
          first_seen_at?: string
          id?: string
          incident_code: string
          last_seen_at?: string
          message: string
          metadata?: Json
          occurrence_count?: number
          resolved_at?: string | null
          resolved_by?: string | null
          route?: string | null
          severity?: string
          source: string
          stack_summary?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          action?: string | null
          action_approved_at?: string | null
          action_approved_by?: string | null
          action_executed_at?: string | null
          ai_action_kind?: string | null
          ai_cause?: string | null
          ai_confidence?: string | null
          ai_error?: string | null
          ai_recommendation?: string | null
          ai_status?: string
          analyzed_at?: string | null
          created_at?: string
          fingerprint?: string
          first_seen_at?: string
          id?: string
          incident_code?: string
          last_seen_at?: string
          message?: string
          metadata?: Json
          occurrence_count?: number
          resolved_at?: string | null
          resolved_by?: string | null
          route?: string | null
          severity?: string
          source?: string
          stack_summary?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      holdings: {
        Row: {
          account_id: string | null
          asset_class: string
          created_at: string
          day_change: number
          id: string
          name: string
          price: number
          shares: number
          symbol: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_id?: string | null
          asset_class?: string
          created_at?: string
          day_change?: number
          id?: string
          name: string
          price?: number
          shares?: number
          symbol: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_id?: string | null
          asset_class?: string
          created_at?: string
          day_change?: number
          id?: string
          name?: string
          price?: number
          shares?: number
          symbol?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holdings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      keepalive_pings: {
        Row: {
          created_at: string
          db_status: string
          detail: string | null
          duration_ms: number
          id: string
          ok: boolean
          source: string
        }
        Insert: {
          created_at?: string
          db_status: string
          detail?: string | null
          duration_ms?: number
          id?: string
          ok: boolean
          source?: string
        }
        Update: {
          created_at?: string
          db_status?: string
          detail?: string | null
          duration_ms?: number
          id?: string
          ok?: boolean
          source?: string
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          decided_at: string | null
          doc_back_url: string | null
          doc_front_url: string | null
          doc_type: string
          id: string
          notes: string | null
          reviewer_id: string | null
          selfie_url: string | null
          status: string
          submitted_at: string
          user_id: string
        }
        Insert: {
          decided_at?: string | null
          doc_back_url?: string | null
          doc_front_url?: string | null
          doc_type: string
          id?: string
          notes?: string | null
          reviewer_id?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string
          user_id: string
        }
        Update: {
          decided_at?: string | null
          doc_back_url?: string | null
          doc_front_url?: string | null
          doc_type?: string
          id?: string
          notes?: string | null
          reviewer_id?: string | null
          selfie_url?: string | null
          status?: string
          submitted_at?: string
          user_id?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          balance: number
          created_at: string
          decided_at: string | null
          decision_notes: string | null
          funding_account_id: string | null
          id: string
          kind: string
          monthly_payment: number
          next_payment_date: string | null
          nickname: string | null
          principal: number
          rate: number
          status: string
          term_months: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          funding_account_id?: string | null
          id?: string
          kind: string
          monthly_payment?: number
          next_payment_date?: string | null
          nickname?: string | null
          principal?: number
          rate?: number
          status?: string
          term_months?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          decided_at?: string | null
          decision_notes?: string | null
          funding_account_id?: string | null
          id?: string
          kind?: string
          monthly_payment?: number
          next_payment_date?: string | null
          nickname?: string | null
          principal?: number
          rate?: number
          status?: string
          term_months?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loans_funding_account_id_fkey"
            columns: ["funding_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pages: {
        Row: {
          blocks: Json
          created_at: string
          hero_image: string | null
          hero_subtitle: string | null
          hero_title: string | null
          id: string
          in_nav: boolean
          meta_description: string | null
          nav_label: string | null
          nav_order: number
          og_image: string | null
          published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          blocks?: Json
          created_at?: string
          hero_image?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          in_nav?: boolean
          meta_description?: string | null
          nav_label?: string | null
          nav_order?: number
          og_image?: string | null
          published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          blocks?: Json
          created_at?: string
          hero_image?: string | null
          hero_subtitle?: string | null
          hero_title?: string | null
          id?: string
          in_nav?: boolean
          meta_description?: string | null
          nav_label?: string | null
          nav_order?: number
          og_image?: string | null
          published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payees: {
        Row: {
          account_number: string | null
          address: string | null
          category: string | null
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          account_number?: string | null
          address?: string | null
          category?: string | null
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          account_number?: string | null
          address?: string | null
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          email: string
          full_name: string | null
          id: string
          kyc_status: string
          notification_prefs: Json
          phone: string | null
          postal_code: string | null
          ssn_last4: string | null
          state: string | null
          status: string
          transaction_limit: number
          two_factor_enabled: boolean
          updated_at: string
          username: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email: string
          full_name?: string | null
          id: string
          kyc_status?: string
          notification_prefs?: Json
          phone?: string | null
          postal_code?: string | null
          ssn_last4?: string | null
          state?: string | null
          status?: string
          transaction_limit?: number
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          email?: string
          full_name?: string | null
          id?: string
          kyc_status?: string
          notification_prefs?: Json
          phone?: string | null
          postal_code?: string | null
          ssn_last4?: string | null
          state?: string | null
          status?: string
          transaction_limit?: number
          two_factor_enabled?: boolean
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      risk_scores: {
        Row: {
          computed_at: string
          factors: Json
          score: number
          user_id: string
        }
        Insert: {
          computed_at?: string
          factors?: Json
          score?: number
          user_id: string
        }
        Update: {
          computed_at?: string
          factors?: Json
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          accent_color: string
          address: string
          brand_name: string
          contact_email: string
          contact_phone: string
          id: number
          logo_url: string | null
          primary_color: string
          public_url: string
          routing_number: string
          socials: Json
          tagline: string
          updated_at: string
        }
        Insert: {
          accent_color?: string
          address?: string
          brand_name?: string
          contact_email?: string
          contact_phone?: string
          id?: number
          logo_url?: string | null
          primary_color?: string
          public_url?: string
          routing_number?: string
          socials?: Json
          tagline?: string
          updated_at?: string
        }
        Update: {
          accent_color?: string
          address?: string
          brand_name?: string
          contact_email?: string
          contact_phone?: string
          id?: number
          logo_url?: string | null
          primary_color?: string
          public_url?: string
          routing_number?: string
          socials?: Json
          tagline?: string
          updated_at?: string
        }
        Relationships: []
      }
      smtp_settings: {
        Row: {
          api_key: string
          enabled: boolean
          from_email: string
          from_name: string | null
          host: string
          id: number
          password: string
          port: number
          provider: string
          reply_to: string | null
          secure: boolean
          updated_at: string
          username: string
        }
        Insert: {
          api_key?: string
          enabled?: boolean
          from_email?: string
          from_name?: string | null
          host?: string
          id?: number
          password?: string
          port?: number
          provider?: string
          reply_to?: string | null
          secure?: boolean
          updated_at?: string
          username?: string
        }
        Update: {
          api_key?: string
          enabled?: boolean
          from_email?: string
          from_name?: string | null
          host?: string
          id?: number
          password?: string
          port?: number
          provider?: string
          reply_to?: string | null
          secure?: boolean
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      statements: {
        Row: {
          account_id: string
          closing_balance: number
          created_at: string
          id: string
          opening_balance: number
          period_end: string
          period_start: string
          user_id: string
        }
        Insert: {
          account_id: string
          closing_balance: number
          created_at?: string
          id?: string
          opening_balance: number
          period_end: string
          period_start: string
          user_id: string
        }
        Update: {
          account_id?: string
          closing_balance?: number
          created_at?: string
          id?: string
          opening_balance?: number
          period_end?: string
          period_start?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "statements_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_staff: boolean
          ticket_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          is_staff?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_staff?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          account_id: string
          amount: number
          category: string | null
          counterparty: string | null
          created_at: string
          currency: string
          description: string
          id: string
          merchant: string | null
          metadata: Json
          reference: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          account_id: string
          amount: number
          category?: string | null
          counterparty?: string | null
          created_at?: string
          currency?: string
          description: string
          id?: string
          merchant?: string | null
          metadata?: Json
          reference?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          account_id?: string
          amount?: number
          category?: string | null
          counterparty?: string | null
          created_at?: string
          currency?: string
          description?: string
          id?: string
          merchant?: string | null
          metadata?: Json
          reference?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          amount: number
          created_at: string
          from_account_id: string
          id: string
          kind: string
          memo: string | null
          receipt_number: string
          status: string
          to_account_id: string | null
          to_external: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          from_account_id: string
          id?: string
          kind: string
          memo?: string | null
          receipt_number?: string
          status?: string
          to_account_id?: string | null
          to_external?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          from_account_id?: string
          id?: string
          kind?: string
          memo?: string | null
          receipt_number?: string
          status?: string
          to_account_id?: string | null
          to_external?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_from_account_id_fkey"
            columns: ["from_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_to_account_id_fkey"
            columns: ["to_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_balance: {
        Args: { _account_id: string; _amount: number; _memo: string }
        Returns: string
      }
      admin_decide_cheque: {
        Args: { _approve: boolean; _id: string; _notes: string }
        Returns: undefined
      }
      admin_decide_kyc: {
        Args: {
          _limit: number
          _notes: string
          _status: string
          _submission_id: string
        }
        Returns: undefined
      }
      admin_decide_loan: {
        Args: { _approve: boolean; _loan_id: string; _notes: string }
        Returns: undefined
      }
      admin_delete_user: { Args: { _user_id: string }; Returns: undefined }
      admin_set_transaction_limit: {
        Args: { _limit: number; _user_id: string }
        Returns: undefined
      }
      admin_set_user_status: {
        Args: { _status: string; _user_id: string }
        Returns: undefined
      }
      apply_for_loan: {
        Args: {
          _funding: string
          _kind: string
          _monthly: number
          _nickname: string
          _principal: number
          _rate: number
          _term: number
        }
        Returns: string
      }
      contribute_ira: {
        Args: { _amount: number; _from: string; _ira: string }
        Returns: string
      }
      execute_transfer: {
        Args: {
          _amount: number
          _external: Json
          _from: string
          _kind: string
          _memo: string
          _to: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      internal_post: {
        Args: {
          _account_id: string
          _amount: number
          _desc: string
          _ref?: string
          _type: string
          _user_id: string
        }
        Returns: string
      }
      my_account_state: { Args: never; Returns: string }
      pay_bill: {
        Args: {
          _amount: number
          _from: string
          _memo: string
          _payee_id: string
        }
        Returns: string
      }
      pay_loan: {
        Args: { _amount: number; _from: string; _loan_id: string }
        Returns: string
      }
      record_error_event: {
        Args: {
          _action: string
          _fingerprint: string
          _incident_code: string
          _message: string
          _metadata: Json
          _route: string
          _severity: string
          _source: string
          _stack_summary: string
        }
        Returns: string
      }
      resolve_transfer_recipient: {
        Args: { _query: string }
        Returns: {
          account_id: string
          display_name: string
          masked_account: string
        }[]
      }
      submit_kyc: {
        Args: {
          _back: string
          _doc_type: string
          _front: string
          _selfie: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "customer" | "admin" | "support"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["customer", "admin", "support"],
    },
  },
} as const
