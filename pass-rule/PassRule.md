# Pass Rule Proposal

### div:

This div should be a part of `signup` or `change-password` page along with password field.

```html
<div id="pass-rule" data-pass-rule="8-16::LU2DS::#$%"></div>
```

### Password Rules:

Notation: `Min-Max::L#U#D#S#::SpecialChars`

The rule consists of 3 parts - length rule, character rule and allowed special chars separated by `::`.  
These are the mandatory requirement for a password generator.

| part                  | description                                                                                                     | example |
| --------------------- | --------------------------------------------------------------------------------------------------------------- | ------- |
| Length Rule           | specifies the min and max length for a valid password                                                           | 8-16    |
| Char Rule             | specifies the allowed character sets and number(#) of mandatory chars from each set.                            | LU2S1   |
| Allowed Special Chars | specifies the special chars allowed in the password. <br>All special chars are allowed when this part is blank. | `#$%`   |

So `8-16::LU2S1::#$%` denotes a password with

- size in range of (8-16)
- can contain lowercase, uppercase and special chars; but not digits.
- must have atleast 2 uppercase and 1 special chars. It may or may not have lowercase chars.
- Only `#$%` can be used as special chars
