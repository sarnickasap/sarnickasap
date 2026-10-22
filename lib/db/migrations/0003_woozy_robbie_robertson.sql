CREATE INDEX "login_attempts_anahtar_zaman_idx" ON "login_attempts" USING btree ("anahtar","zaman");--> statement-breakpoint
CREATE INDEX "products_category_id_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
ALTER TABLE "deals" ADD CONSTRAINT "deals_fiyat_pozitif" CHECK ("deals"."old_price" >= 0 and "deals"."new_price" >= 0);--> statement-breakpoint
ALTER TABLE "hours" ADD CONSTRAINT "hours_gun_araligi" CHECK ("hours"."day_index" between 0 and 6);--> statement-breakpoint
ALTER TABLE "hours" ADD CONSTRAINT "hours_bicim" CHECK ("hours"."open" ~ '^[0-2][0-9]:[0-5][0-9]$' and "hours"."close" ~ '^[0-2][0-9]:[0-5][0-9]$');--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_fiyat_pozitif" CHECK ("products"."price" >= 0);--> statement-breakpoint
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_puan_araligi" CHECK ("reviews"."rating" between 1 and 5);