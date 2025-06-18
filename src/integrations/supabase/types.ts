export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          account_code: string
          account_name: string
          account_type: string
          balance: number
          business_id: string | null
          created_at: string
          created_by: string
          firm_id: string | null
          id: string
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_code: string
          account_name: string
          account_type: string
          balance?: number
          business_id?: string | null
          created_at?: string
          created_by: string
          firm_id?: string | null
          id?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_code?: string
          account_name?: string
          account_type?: string
          balance?: number
          business_id?: string | null
          created_at?: string
          created_by?: string
          firm_id?: string | null
          id?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          billing_cycle: string | null
          business_id: string | null
          business_type: string | null
          city: string | null
          country: string | null
          created_at: string
          created_by: string
          email: string | null
          firm_id: string | null
          gst_number: string | null
          gstin: string | null
          id: string
          industry: string | null
          monthly_fee: number | null
          name: string
          pan_number: string | null
          phone: string | null
          postal_code: string | null
          state: string | null
          status: string | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          billing_cycle?: string | null
          business_id?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by: string
          email?: string | null
          firm_id?: string | null
          gst_number?: string | null
          gstin?: string | null
          id?: string
          industry?: string | null
          monthly_fee?: number | null
          name: string
          pan_number?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          billing_cycle?: string | null
          business_id?: string | null
          business_type?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          created_by?: string
          email?: string | null
          firm_id?: string | null
          gst_number?: string | null
          gstin?: string | null
          id?: string
          industry?: string | null
          monthly_fee?: number | null
          name?: string
          pan_number?: string | null
          phone?: string | null
          postal_code?: string | null
          state?: string | null
          status?: string | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_tasks: {
        Row: {
          created_at: string | null
          created_by: string
          deliverable_id: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deliverable_id: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deliverable_id?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_tasks_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverable_threads: {
        Row: {
          created_at: string | null
          created_by: string
          deliverable_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          deliverable_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          deliverable_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverable_threads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverable_threads_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      deliverables: {
        Row: {
          assigned_to: string | null
          business_id: string | null
          client_id: string
          created_at: string
          created_by: string
          deliverable_type: string | null
          description: string | null
          due_date: string | null
          file_urls: string[] | null
          firm_id: string | null
          frequency: string | null
          id: string
          input_checklist: Json | null
          priority: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          business_id?: string | null
          client_id: string
          created_at?: string
          created_by: string
          deliverable_type?: string | null
          description?: string | null
          due_date?: string | null
          file_urls?: string[] | null
          firm_id?: string | null
          frequency?: string | null
          id?: string
          input_checklist?: Json | null
          priority?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          business_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          deliverable_type?: string | null
          description?: string | null
          due_date?: string | null
          file_urls?: string[] | null
          firm_id?: string | null
          frequency?: string | null
          id?: string
          input_checklist?: Json | null
          priority?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliverables_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliverables_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string | null
          category: string | null
          created_at: string
          created_by: string
          description: string
          expense_date: string
          firm_id: string | null
          id: string
          receipt_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          business_id?: string | null
          category?: string | null
          created_at?: string
          created_by: string
          description: string
          expense_date: string
          firm_id?: string | null
          id?: string
          receipt_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string | null
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string
          expense_date?: string
          firm_id?: string | null
          id?: string
          receipt_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          postal_code: string | null
          registration_number: string | null
          state: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          postal_code?: string | null
          registration_number?: string | null
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          id: string
          invoice_id: string
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          business_id: string | null
          client_id: string
          created_at: string
          created_by: string
          due_date: string | null
          firm_id: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          status: string
          subtotal: number
          tax_amount: number
          total_amount: number
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          client_id: string
          created_at?: string
          created_by: string
          due_date?: string | null
          firm_id?: string | null
          id?: string
          invoice_number: string
          issue_date: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          due_date?: string | null
          firm_id?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          business_id: string | null
          business_name: string | null
          created_at: string
          email: string
          firm_id: string | null
          firm_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          status: string | null
          updated_at: string
          user_group: Database["public"]["Enums"]["user_group"]
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string
          email: string
          firm_id?: string | null
          firm_name?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_group: Database["public"]["Enums"]["user_group"]
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          business_id?: string | null
          business_name?: string | null
          created_at?: string
          email?: string
          firm_id?: string | null
          firm_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          status?: string | null
          updated_at?: string
          user_group?: Database["public"]["Enums"]["user_group"]
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "profiles_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          approved_by: string | null
          business_id: string | null
          client_id: string
          created_at: string | null
          created_by: string
          file_url: string | null
          firm_id: string | null
          id: string
          notes: string | null
          period_end: string | null
          period_start: string | null
          report_data: Json | null
          report_type: string
          status: string | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          approved_by?: string | null
          business_id?: string | null
          client_id: string
          created_at?: string | null
          created_by: string
          file_url?: string | null
          firm_id?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          report_data?: Json | null
          report_type: string
          status?: string | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          approved_by?: string | null
          business_id?: string | null
          client_id?: string
          created_at?: string | null
          created_by?: string
          file_url?: string | null
          firm_id?: string | null
          id?: string
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          report_data?: Json | null
          report_type?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      request_messages: {
        Row: {
          created_at: string | null
          id: string
          is_internal: boolean | null
          message_text: string
          request_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message_text: string
          request_id: string
          sender_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          message_text?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      requests: {
        Row: {
          assigned_to: string | null
          business_id: string | null
          client_id: string
          created_at: string
          created_by: string
          description: string | null
          firm_id: string | null
          id: string
          priority: string
          request_type: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          business_id?: string | null
          client_id: string
          created_at?: string
          created_by: string
          description?: string | null
          firm_id?: string | null
          id?: string
          priority?: string
          request_type?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          business_id?: string | null
          client_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          firm_id?: string | null
          id?: string
          priority?: string
          request_type?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          assigned_to: string
          created_at: string | null
          id: string
          notes: string | null
          task_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          assigned_to: string
          created_at?: string | null
          id?: string
          notes?: string | null
          task_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          assigned_to?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_assignments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "deliverable_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          comment_text: string
          created_at: string | null
          created_by: string
          id: string
          task_id: string
        }
        Insert: {
          comment_text: string
          created_at?: string | null
          created_by: string
          id?: string
          task_id: string
        }
        Update: {
          comment_text?: string
          created_at?: string | null
          created_by?: string
          id?: string
          task_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "deliverable_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      team_client_assignments: {
        Row: {
          assigned_at: string | null
          assigned_by: string
          client_id: string
          created_at: string | null
          id: string
          team_member_id: string
          updated_at: string | null
        }
        Insert: {
          assigned_at?: string | null
          assigned_by: string
          client_id: string
          created_at?: string | null
          id?: string
          team_member_id: string
          updated_at?: string | null
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string
          client_id?: string
          created_at?: string | null
          id?: string
          team_member_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_client_assignments_team_member_id_fkey"
            columns: ["team_member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_attachments: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          message_id: string
          uploaded_at: string | null
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          message_id: string
          uploaded_at?: string | null
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          message_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "thread_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "thread_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      thread_messages: {
        Row: {
          created_at: string | null
          id: string
          message: string
          sender_id: string
          thread_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          sender_id: string
          thread_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          sender_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "thread_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "thread_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "deliverable_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_comments: {
        Row: {
          comment: string
          created_at: string | null
          id: string
          transaction_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string | null
          id?: string
          transaction_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string | null
          id?: string
          transaction_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_comments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_documents: {
        Row: {
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          transaction_id: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          transaction_id: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          transaction_id?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_documents_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transaction_review_log: {
        Row: {
          action: string
          comment: string | null
          created_at: string | null
          id: string
          reviewer_id: string
          transaction_id: string
        }
        Insert: {
          action: string
          comment?: string | null
          created_at?: string | null
          id?: string
          reviewer_id: string
          transaction_id: string
        }
        Update: {
          action?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          reviewer_id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transaction_review_log_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_review_log_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          business_id: string | null
          category: string | null
          client_id: string | null
          created_at: string
          created_by: string
          cycle: string | null
          deliverable_id: string | null
          document_url: string | null
          firm_id: string | null
          id: string
          lines: Json | null
          narration: string
          reference_number: string | null
          source: string | null
          status: string | null
          transaction_date: string
          updated_at: string
        }
        Insert: {
          amount: number
          business_id?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string
          created_by: string
          cycle?: string | null
          deliverable_id?: string | null
          document_url?: string | null
          firm_id?: string | null
          id?: string
          lines?: Json | null
          narration: string
          reference_number?: string | null
          source?: string | null
          status?: string | null
          transaction_date: string
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string | null
          category?: string | null
          client_id?: string | null
          created_at?: string
          created_by?: string
          cycle?: string | null
          deliverable_id?: string | null
          document_url?: string | null
          firm_id?: string | null
          id?: string
          lines?: Json | null
          narration?: string
          reference_number?: string | null
          source?: string | null
          status?: string | null
          transaction_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_deliverable_id_fkey"
            columns: ["deliverable_id"]
            isOneToOne: false
            referencedRelation: "deliverables"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_assignments: {
        Row: {
          assigned_by: string
          client_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          assigned_by: string
          client_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          assigned_by?: string
          client_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          id: string
          updated_at: string
          user_id: string
          view_mode: string | null
        }
        Insert: {
          id?: string
          updated_at?: string
          user_id: string
          view_mode?: string | null
        }
        Update: {
          id?: string
          updated_at?: string
          user_id?: string
          view_mode?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_client: {
        Args: { target_client_id: string }
        Returns: boolean
      }
      can_access_deliverable_thread: {
        Args: { thread_deliverable_id: string }
        Returns: boolean
      }
      get_current_user_business_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_firm_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_group: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_group"]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_current_user_view_mode: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_assigned_clients: {
        Args: Record<PropertyKey, never>
        Returns: {
          client_id: string
        }[]
      }
      get_user_assigned_tasks: {
        Args: Record<PropertyKey, never>
        Returns: {
          task_id: string
          deliverable_id: string
          client_id: string
          title: string
          status: string
          due_date: string
        }[]
      }
      set_user_view_mode: {
        Args: { new_mode: string }
        Returns: undefined
      }
    }
    Enums: {
      user_group: "accounting_firm" | "business_owner"
      user_role:
        | "partner"
        | "senior_staff"
        | "staff"
        | "client"
        | "management"
        | "accounting_team"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_group: ["accounting_firm", "business_owner"],
      user_role: [
        "partner",
        "senior_staff",
        "staff",
        "client",
        "management",
        "accounting_team",
      ],
    },
  },
} as const
