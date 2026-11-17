<?php
// backend/helpers/Validator.php

class Validator {
    private array $data;
    private array $errors = [];

    public function __construct(array $data) {
        $this->data = $data;
    }

    public function validate(array $rules): bool {
        foreach ($rules as $field => $fieldRules) {
            $ruleList = is_string($fieldRules) ? explode('|', $fieldRules) : $fieldRules;
            $value = $this->data[$field] ?? null;

            foreach ($ruleList as $rule) {
                $params = [];
                if (strpos($rule, ':') !== false) {
                    [$rule, $paramStr] = explode(':', $rule, 2);
                    $params = explode(',', $paramStr);
                }

                switch ($rule) {
                    case 'required':
                        if ($value === null || $value === '' || (is_array($value) && empty($value))) {
                            $this->errors[$field][] = "The {$field} field is required.";
                        }
                        break;
                    case 'email':
                        if ($value !== null && $value !== '' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                            $this->errors[$field][] = "The {$field} must be a valid email address.";
                        }
                        break;
                    case 'numeric':
                        if ($value !== null && $value !== '' && !is_numeric($value)) {
                            $this->errors[$field][] = "The {$field} must be a number.";
                        }
                        break;
                    case 'min':
                        $min = (int)($params[0] ?? 0);
                        if (is_string($value) && mb_strlen($value) < $min) {
                            $this->errors[$field][] = "The {$field} must be at least {$min} characters.";
                        }
                        break;
                    case 'in':
                        if ($value !== null && $value !== '' && !in_array($value, $params)) {
                            $this->errors[$field][] = "The {$field} is invalid. Allowed: " . implode(', ', $params);
                        }
                        break;
                }
            }
        }
        return empty($this->errors);
    }

    public function errors(): array {
        return $this->errors;
    }
}

