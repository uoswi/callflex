export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      industries: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          icon?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          industry_id: string | null
          business_type: string | null
          timezone: string
          primary_email: string
          primary_phone: string | null
          website: string | null
          address_city: string | null
          address_state: string | null
          address_country: string
          address_postal: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan_id: string | null
          billing_email: string | null
          current_period_minutes_used: number
          current_period_start: string | null
          current_period_end: string | null
          status: string
          trial_ends_at: string | null
          settings: Json
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          name: string
          slug: string
          industry_id?: string | null
          business_type?: string | null
          timezone?: string
          primary_email: string
          primary_phone?: string | null
          website?: string | null
          address_city?: string | null
          address_state?: string | null
          address_country?: string
          address_postal?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string | null
          billing_email?: string | null
          current_period_minutes_used?: number
          current_period_start?: string | null
          current_period_end?: string | null
          status?: string
          trial_ends_at?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          industry_id?: string | null
          business_type?: string | null
          timezone?: string
          primary_email?: string
          primary_phone?: string | null
          website?: string | null
          address_city?: string | null
          address_state?: string | null
          address_country?: string
          address_postal?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan_id?: string | null
          billing_email?: string | null
          current_period_minutes_used?: number
          current_period_start?: string | null
          current_period_end?: string | null
          status?: string
          trial_ends_at?: string | null
          settings?: Json
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          display_name: string
          price_monthly: number
          price_yearly: number | null
          included_minutes: number
          max_phone_numbers: number
          max_assistants: number | null
          max_team_members: number | null
          overage_rate_per_minute: number
          features: Json
          stripe_product_id: string | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          display_name: string
          price_monthly: number
          price_yearly?: number | null
          included_minutes: number
          max_phone_numbers: number
          max_assistants?: number | null
          max_team_members?: number | null
          overage_rate_per_minute: number
          features?: Json
          stripe_product_id?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          display_name?: string
          price_monthly?: number
          price_yearly?: number | null
          included_minutes?: number
          max_phone_numbers?: number
          max_assistants?: number | null
          max_team_members?: number | null
          overage_rate_per_minute?: number
          features?: Json
          stripe_product_id?: string | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          short_description: string | null
          industry_id: string | null
          category: string | null
          tags: string[]
          icon: string | null
          system_prompt: string
          first_message: string | null
          end_call_message: string | null
          voice_provider: string
          voice_id: string | null
          model_provider: string
          model_name: string
          temperature: number
          variables: Json
          available_functions: Json
          default_function_config: Json
          sample_conversation: Json
          estimated_setup_minutes: number
          difficulty: string
          is_premium: boolean
          is_featured: boolean
          is_active: boolean
          author_type: string
          author_id: string | null
          author_name: string | null
          use_count: number
          rating_average: number | null
          rating_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          short_description?: string | null
          industry_id?: string | null
          category?: string | null
          tags?: string[]
          icon?: string | null
          system_prompt: string
          first_message?: string | null
          end_call_message?: string | null
          voice_provider?: string
          voice_id?: string | null
          model_provider?: string
          model_name?: string
          temperature?: number
          variables?: Json
          available_functions?: Json
          default_function_config?: Json
          sample_conversation?: Json
          estimated_setup_minutes?: number
          difficulty?: string
          is_premium?: boolean
          is_featured?: boolean
          is_active?: boolean
          author_type?: string
          author_id?: string | null
          author_name?: string | null
          use_count?: number
          rating_average?: number | null
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          short_description?: string | null
          industry_id?: string | null
          category?: string | null
          tags?: string[]
          icon?: string | null
          system_prompt?: string
          first_message?: string | null
          end_call_message?: string | null
          voice_provider?: string
          voice_id?: string | null
          model_provider?: string
          model_name?: string
          temperature?: number
          variables?: Json
          available_functions?: Json
          default_function_config?: Json
          sample_conversation?: Json
          estimated_setup_minutes?: number
          difficulty?: string
          is_premium?: boolean
          is_featured?: boolean
          is_active?: boolean
          author_type?: string
          author_id?: string | null
          author_name?: string | null
          use_count?: number
          rating_average?: number | null
          rating_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      assistants: {
        Row: {
          id: string
          organization_id: string
          template_id: string | null
          name: string
          description: string | null
          system_prompt: string
          first_message: string | null
          end_call_message: string | null
          voice_provider: string
          voice_id: string | null
          model_provider: string
          model_name: string
          temperature: number
          variable_values: Json
          enabled_functions: Json
          function_config: Json
          max_duration_seconds: number
          silence_timeout_seconds: number
          background_sound: string
          vapi_assistant_id: string | null
          vapi_synced_at: string | null
          vapi_sync_error: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          template_id?: string | null
          name: string
          description?: string | null
          system_prompt: string
          first_message?: string | null
          end_call_message?: string | null
          voice_provider?: string
          voice_id?: string | null
          model_provider?: string
          model_name?: string
          temperature?: number
          variable_values?: Json
          enabled_functions?: Json
          function_config?: Json
          max_duration_seconds?: number
          silence_timeout_seconds?: number
          background_sound?: string
          vapi_assistant_id?: string | null
          vapi_synced_at?: string | null
          vapi_sync_error?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          template_id?: string | null
          name?: string
          description?: string | null
          system_prompt?: string
          first_message?: string | null
          end_call_message?: string | null
          voice_provider?: string
          voice_id?: string | null
          model_provider?: string
          model_name?: string
          temperature?: number
          variable_values?: Json
          enabled_functions?: Json
          function_config?: Json
          max_duration_seconds?: number
          silence_timeout_seconds?: number
          background_sound?: string
          vapi_assistant_id?: string | null
          vapi_synced_at?: string | null
          vapi_sync_error?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      phone_numbers: {
        Row: {
          id: string
          organization_id: string
          phone_number: string
          friendly_name: string | null
          country: string
          region: string | null
          locality: string | null
          provider: string
          provider_sid: string | null
          assistant_id: string | null
          routing_rules: Json
          status: string
          capabilities: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number: string
          friendly_name?: string | null
          country?: string
          region?: string | null
          locality?: string | null
          provider?: string
          provider_sid?: string | null
          assistant_id?: string | null
          routing_rules?: Json
          status?: string
          capabilities?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number?: string
          friendly_name?: string | null
          country?: string
          region?: string | null
          locality?: string | null
          provider?: string
          provider_sid?: string | null
          assistant_id?: string | null
          routing_rules?: Json
          status?: string
          capabilities?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          auth_id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          email_verified: boolean
          last_sign_in_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          email_verified?: boolean
          last_sign_in_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      organization_members: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          role: string
          invited_by: string | null
          invited_at: string | null
          accepted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          user_id: string
          role?: string
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          user_id?: string
          role?: string
          invited_by?: string | null
          invited_at?: string | null
          accepted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          organization_id: string
          vapi_call_id: string | null
          provider_call_sid: string | null
          phone_number_id: string | null
          assistant_id: string | null
          from_number: string
          to_number: string
          started_at: string
          answered_at: string | null
          ended_at: string | null
          duration_seconds: number | null
          status: string
          direction: string
          ended_reason: string | null
          call_type: string | null
          sentiment: string | null
          summary: string | null
          was_transferred: boolean
          transfer_destination: string | null
          voicemail_left: boolean
          appointment_booked: boolean
          cost_cents: number | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          vapi_call_id?: string | null
          provider_call_sid?: string | null
          phone_number_id?: string | null
          assistant_id?: string | null
          from_number: string
          to_number: string
          started_at: string
          answered_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          status: string
          direction?: string
          ended_reason?: string | null
          call_type?: string | null
          sentiment?: string | null
          summary?: string | null
          was_transferred?: boolean
          transfer_destination?: string | null
          voicemail_left?: boolean
          appointment_booked?: boolean
          cost_cents?: number | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          vapi_call_id?: string | null
          provider_call_sid?: string | null
          phone_number_id?: string | null
          assistant_id?: string | null
          from_number?: string
          to_number?: string
          started_at?: string
          answered_at?: string | null
          ended_at?: string | null
          duration_seconds?: number | null
          status?: string
          direction?: string
          ended_reason?: string | null
          call_type?: string | null
          sentiment?: string | null
          summary?: string | null
          was_transferred?: boolean
          transfer_destination?: string | null
          voicemail_left?: boolean
          appointment_booked?: boolean
          cost_cents?: number | null
          metadata?: Json
          created_at?: string
        }
      }
      call_transcripts: {
        Row: {
          id: string
          call_id: string
          call_created_at: string
          organization_id: string
          transcript_text: string | null
          transcript_segments: Json | null
          summary: string | null
          extracted_data: Json
          search_vector: unknown | null
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          call_created_at: string
          organization_id: string
          transcript_text?: string | null
          transcript_segments?: Json | null
          summary?: string | null
          extracted_data?: Json
          search_vector?: unknown | null
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          call_created_at?: string
          organization_id?: string
          transcript_text?: string | null
          transcript_segments?: Json | null
          summary?: string | null
          extracted_data?: Json
          search_vector?: unknown | null
          created_at?: string
        }
      }
      call_recordings: {
        Row: {
          id: string
          call_id: string
          call_created_at: string
          organization_id: string
          storage_bucket: string
          storage_path: string
          duration_seconds: number | null
          file_size_bytes: number | null
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: string
          call_id: string
          call_created_at: string
          organization_id: string
          storage_bucket?: string
          storage_path: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          mime_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          call_id?: string
          call_created_at?: string
          organization_id?: string
          storage_bucket?: string
          storage_path?: string
          duration_seconds?: number | null
          file_size_bytes?: number | null
          mime_type?: string
          created_at?: string
        }
      }
      call_actions: {
        Row: {
          id: string
          call_id: string
          call_created_at: string
          organization_id: string
          action_type: string
          action_data: Json
          status: string
          error_message: string | null
          triggered_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          call_id: string
          call_created_at: string
          organization_id: string
          action_type: string
          action_data?: Json
          status?: string
          error_message?: string | null
          triggered_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          call_id?: string
          call_created_at?: string
          organization_id?: string
          action_type?: string
          action_data?: Json
          status?: string
          error_message?: string | null
          triggered_at?: string
          completed_at?: string | null
        }
      }
      contacts: {
        Row: {
          id: string
          organization_id: string
          phone_number: string
          email: string | null
          name: string | null
          contact_type: string | null
          tags: string[]
          custom_fields: Json
          total_calls: number
          last_call_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          phone_number: string
          email?: string | null
          name?: string | null
          contact_type?: string | null
          tags?: string[]
          custom_fields?: Json
          total_calls?: number
          last_call_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          phone_number?: string
          email?: string | null
          name?: string | null
          contact_type?: string | null
          tags?: string[]
          custom_fields?: Json
          total_calls?: number
          last_call_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      integrations: {
        Row: {
          id: string
          organization_id: string
          provider: string
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          config: Json
          status: string
          last_sync_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          provider: string
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          config?: Json
          status?: string
          last_sync_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          provider?: string
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          config?: Json
          status?: string
          last_sync_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      daily_usage: {
        Row: {
          id: string
          organization_id: string
          date: string
          total_calls: number
          total_minutes: number
          calls_by_assistant: Json
          calls_by_outcome: Json
          total_cost_cents: number
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          date: string
          total_calls?: number
          total_minutes?: number
          calls_by_assistant?: Json
          calls_by_outcome?: Json
          total_cost_cents?: number
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          date?: string
          total_calls?: number
          total_minutes?: number
          calls_by_assistant?: Json
          calls_by_outcome?: Json
          total_cost_cents?: number
          created_at?: string
        }
      }
      billing_events: {
        Row: {
          id: string
          organization_id: string
          event_type: string
          stripe_event_id: string | null
          stripe_invoice_id: string | null
          amount_cents: number | null
          currency: string
          description: string | null
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          event_type: string
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
          amount_cents?: number | null
          currency?: string
          description?: string | null
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          event_type?: string
          stripe_event_id?: string | null
          stripe_invoice_id?: string | null
          amount_cents?: number | null
          currency?: string
          description?: string | null
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}
