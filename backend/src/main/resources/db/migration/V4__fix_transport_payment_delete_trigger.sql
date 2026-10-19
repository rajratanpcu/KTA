-- Recreate the balance trigger so allocation deletes use OLD.bill_id.
CREATE OR REPLACE FUNCTION update_transport_bill_balance()
RETURNS TRIGGER AS $$
DECLARE
    affected_bill_id BIGINT;
BEGIN
    affected_bill_id := COALESCE(NEW.bill_id, OLD.bill_id);

    UPDATE transport_bills
    SET balance_due = total_amount - COALESCE(
        (SELECT SUM(allocated_amount)
         FROM transport_payment_allocations
         WHERE bill_id = affected_bill_id), 0
    ),
    status = CASE
        WHEN total_amount <= COALESCE(
            (SELECT SUM(allocated_amount)
             FROM transport_payment_allocations
             WHERE bill_id = affected_bill_id), 0
        ) THEN 'PAID'
        WHEN COALESCE(
            (SELECT SUM(allocated_amount)
             FROM transport_payment_allocations
             WHERE bill_id = affected_bill_id), 0
        ) > 0 THEN 'PARTIALLY_PAID'
        ELSE status
    END
    WHERE id = affected_bill_id;

    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;