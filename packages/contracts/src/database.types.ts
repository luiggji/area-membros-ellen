
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "public": {
          Tables: {
            "audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"actor_role": string,"after": Json | null,"before": Json | null,"correlation_id": string | null,"happened_at": string,"id": string,"target_id": string | null,"target_type": string
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"actor_role": string,"after"?: Json | null,"before"?: Json | null,"correlation_id"?: string | null,"happened_at"?: string,"id"?: string,"target_id"?: string | null,"target_type": string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"actor_role"?: string,"after"?: Json | null,"before"?: Json | null,"correlation_id"?: string | null,"happened_at"?: string,"id"?: string,"target_id"?: string | null,"target_type"?: string
                  }
                  Relationships: [
                    
                  ]
                },"consents": {
                  Row: {
                    "accepted_at": string,"id": string,"policy_version_id": string,"revoked_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_at"?: string,"id"?: string,"policy_version_id": string,"revoked_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "accepted_at"?: string,"id"?: string,"policy_version_id"?: string,"revoked_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "consents_policy_version_id_fkey"
      columns: ["policy_version_id"]
isOneToOne: false
      referencedRelation: "policy_versions"
      referencedColumns: ["id"]
    }
                  ]
                },"entitlements": {
                  Row: {
                    "created_at": string,"granted_by": string | null,"id": string,"reason": string | null,"resource_scope": string,"revoked_at": string | null,"source": string,"source_subscription_id": string | null,"user_id": string,"valid_from": string,"valid_to": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"granted_by"?: string | null,"id"?: string,"reason"?: string | null,"resource_scope"?: string,"revoked_at"?: string | null,"source": string,"source_subscription_id"?: string | null,"user_id": string,"valid_from"?: string,"valid_to"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"granted_by"?: string | null,"id"?: string,"reason"?: string | null,"resource_scope"?: string,"revoked_at"?: string | null,"source"?: string,"source_subscription_id"?: string | null,"user_id"?: string,"valid_from"?: string,"valid_to"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "entitlements_source_subscription_id_fkey"
      columns: ["source_subscription_id"]
isOneToOne: false
      referencedRelation: "subscriptions"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount_cents": number,"confirmed_at": string | null,"created_at": string,"currency": string,"id": string,"kind": string,"provider": string,"provider_id": string,"status": string,"subscription_id": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"confirmed_at"?: string | null,"created_at"?: string,"currency"?: string,"id"?: string,"kind": string,"provider"?: string,"provider_id": string,"status": string,"subscription_id"?: string | null,"user_id": string
                  }
                  Update: {
                    "amount_cents"?: number,"confirmed_at"?: string | null,"created_at"?: string,"currency"?: string,"id"?: string,"kind"?: string,"provider"?: string,"provider_id"?: string,"status"?: string,"subscription_id"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_subscription_id_fkey"
      columns: ["subscription_id"]
isOneToOne: false
      referencedRelation: "subscriptions"
      referencedColumns: ["id"]
    }
                  ]
                },"plans": {
                  Row: {
                    "active": boolean,"code": string,"created_at": string,"description": string | null,"id": string,"name": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"code": string,"created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"code"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"policy_versions": {
                  Row: {
                    "body_md": string,"created_at": string,"id": string,"kind": string,"published_at": string | null,"status": string,"title": string,"version": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body_md": string,"created_at"?: string,"id"?: string,"kind": string,"published_at"?: string | null,"status"?: string,"title": string,"version": string
                  }
                  Update: {
                    "body_md"?: string,"created_at"?: string,"id"?: string,"kind"?: string,"published_at"?: string | null,"status"?: string,"title"?: string,"version"?: string
                  }
                  Relationships: [
                    
                  ]
                },"price_versions": {
                  Row: {
                    "amount_cents": number,"created_at": string,"currency": string,"effective_at": string,"gateway_price_id": string | null,"id": string,"interval": string,"is_sellable": boolean,"plan_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_cents": number,"created_at"?: string,"currency"?: string,"effective_at"?: string,"gateway_price_id"?: string | null,"id"?: string,"interval": string,"is_sellable"?: boolean,"plan_id": string
                  }
                  Update: {
                    "amount_cents"?: number,"created_at"?: string,"currency"?: string,"effective_at"?: string,"gateway_price_id"?: string | null,"id"?: string,"interval"?: string,"is_sellable"?: boolean,"plan_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "price_versions_plan_id_fkey"
      columns: ["plan_id"]
isOneToOne: false
      referencedRelation: "plans"
      referencedColumns: ["id"]
    }
                  ]
                },"subscriptions": {
                  Row: {
                    "created_at": string,"current_period_end": string | null,"id": string,"price_version_id": string,"provider": string,"provider_id": string | null,"renewal_policy": string,"status": string,"updated_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"current_period_end"?: string | null,"id"?: string,"price_version_id": string,"provider"?: string,"provider_id"?: string | null,"renewal_policy"?: string,"status"?: string,"updated_at"?: string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"current_period_end"?: string | null,"id"?: string,"price_version_id"?: string,"provider"?: string,"provider_id"?: string | null,"renewal_policy"?: string,"status"?: string,"updated_at"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "subscriptions_price_version_id_fkey"
      columns: ["price_version_id"]
isOneToOne: false
      referencedRelation: "price_versions"
      referencedColumns: ["id"]
    }
                  ]
                },"user_profiles": {
                  Row: {
                    "bio": string | null,"city": string | null,"created_at": string,"directory_opt_in": boolean,"id": string,"main_goal": string | null,"name": string | null,"onboarding_completed_at": string | null,"professional_stage": string | null,"state": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bio"?: string | null,"city"?: string | null,"created_at"?: string,"directory_opt_in"?: boolean,"id": string,"main_goal"?: string | null,"name"?: string | null,"onboarding_completed_at"?: string | null,"professional_stage"?: string | null,"state"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "bio"?: string | null,"city"?: string | null,"created_at"?: string,"directory_opt_in"?: boolean,"id"?: string,"main_goal"?: string | null,"name"?: string | null,"onboarding_completed_at"?: string | null,"professional_stage"?: string | null,"state"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"user_roles": {
                  Row: {
                    "granted_at": string,"granted_by": string | null,"role": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "granted_at"?: string,"granted_by"?: string | null,"role": string,"user_id": string
                  }
                  Update: {
                    "granted_at"?: string,"granted_by"?: string | null,"role"?: string,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"webhook_receipts": {
                  Row: {
                    "attempts": number,"event_type": string,"id": string,"last_error": string | null,"processed_at": string | null,"processing_status": string,"provider": string,"provider_event_id": string,"received_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"event_type": string,"id"?: string,"last_error"?: string | null,"processed_at"?: string | null,"processing_status"?: string,"provider": string,"provider_event_id": string,"received_at"?: string
                  }
                  Update: {
                    "attempts"?: number,"event_type"?: string,"id"?: string,"last_error"?: string | null,"processed_at"?: string | null,"processing_status"?: string,"provider"?: string,"provider_event_id"?: string,"received_at"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "access_of_user":
{ Args: { "p_scope"?: string,"p_user": string }; Returns: {
              "source": string,"subscription_status": string,"valid_until": string
            }[]
                           },
"my_access":
{ Args: { "p_scope"?: string }; Returns: {
              "source": string,"subscription_status": string,"valid_until": string
            }[]
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            
          }
        }
} as const
