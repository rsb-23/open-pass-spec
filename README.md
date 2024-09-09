# open-pass-spec

Standard specification for password generation and storage.

## Password Generation

Password Generation is a fundamental aspect of online security, helping to safeguard our digital identity, protect our valuable information and sometimes organization compliances.

Password Generator Tools are used to generate strong, complex and unique passwords for every account. These tools are built into browsers (like Firefox), browser extensions and Password Managers.

However, these tools have scope of improvements.

### Case : Invalid password generation

Every website have different set of rules for a valid password. Since the tool isn't aware of the rule, sometimes it takes multiple tries or manual changes to generate a valid password for the site. This can be a bit of inconvenience.

**Proposed Solution :**

> POC : [Demo Signup Page](https://rsb-23.github.io/open-pass-spec/pass-rule)

It can be solved by

- adding a hidden div with password rules in the signup page.
- tools can access div using `div[data-pass-rule]` selector.
- Rule is stored in a standard format, making it easy to parse and implement.

[read in detail ...][passrule]

```html
<div id="pass-rule" data-pass-rule="8-16::LU2DS::#$%"></div>
```

[passrule]: ./pass-rule/PassRule.md
