
import styles from './ProfilePanel.module.css'

export type ProfileFormData = {
  name: string
  phone: string
  businessType: string
  language: 'sw' | 'en'
}

type ProfileCopy = {
  title: string
  description: string
  edit: string
  save: string
  cancel: string
  fields: { name: string; phone: string; businessType: string; language: string }
  languageOptions: Record<'sw' | 'en', string>
  businessPlaceholder: string
}

type ProfilePanelProps = {
  value: ProfileFormData
  copy: ProfileCopy
  isEditing: boolean
  onEdit: () => void
  onCancel: () => void
  onSave: () => void
  onChange: (field: keyof ProfileFormData, value: string) => void
}

const ProfilePanel = ({ value, copy, isEditing, onEdit, onCancel, onSave, onChange }: ProfilePanelProps) => (
  <section className={styles.card}>
    <header className={styles.cardHeader}>
      <div className={styles.cardTitleGroup}>
        <span className={styles.cardIcon} aria-hidden>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
        </span>
        <div>
          <h2 className={styles.cardTitle}>{copy.title}</h2>
          <p className={styles.cardSubtitle}>{copy.description}</p>
        </div>
      </div>

      {!isEditing ? (
        <button type="button" className={styles.ghostButton} onClick={onEdit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          {copy.edit}
        </button>
      ) : (
        <div className={styles.editActions}>
          <button type="button" className={styles.ghostButton} onClick={onCancel}>
            {copy.cancel}
          </button>
          <button type="button" className={styles.primaryButton} onClick={onSave}>
            {copy.save}
          </button>
        </div>
      )}
    </header>

    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="profile-name">{copy.fields.name}</label>
      {isEditing ? (
        <input
          id="profile-name"
          type="text"
          className={styles.input}
          value={value.name}
          onChange={(event) => onChange('name', event.target.value)}
        />
      ) : (
        <div className={styles.fieldInput}>{value.name}</div>
      )}
    </div>

    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="profile-phone">{copy.fields.phone}</label>
      {isEditing ? (
        <input
          id="profile-phone"
          type="tel"
          className={styles.input}
          value={value.phone}
          onChange={(event) => onChange('phone', event.target.value)}
        />
      ) : (
        <div className={styles.fieldInput}>{value.phone}</div>
      )}
    </div>

    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="profile-business">{copy.fields.businessType}</label>
      {isEditing ? (
        <input
          id="profile-business"
          type="text"
          className={styles.input}
          value={value.businessType}
          onChange={(event) => onChange('businessType', event.target.value)}
          placeholder={copy.businessPlaceholder}
        />
      ) : (
        <div className={styles.fieldInput}>{value.businessType}</div>
      )}
    </div>

    <div className={styles.fieldGroup}>
      <label className={styles.fieldLabel} htmlFor="profile-language">{copy.fields.language}</label>
      {isEditing ? (
        <div className={styles.selectWrapper}>
          <select
            id="profile-language"
            className={styles.select}
            value={value.language}
            onChange={(event) => onChange('language', event.target.value as ProfileFormData['language'])}
          >
            {(Object.keys(copy.languageOptions) as ('sw' | 'en')[]).map((option) => (
              <option key={option} value={option}>
                {copy.languageOptions[option]}
              </option>
            ))}
          </select>
          <span aria-hidden className={styles.selectChevron}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      ) : (
        <div className={styles.fieldInput}>{copy.languageOptions[value.language]}</div>
      )}
    </div>
  </section>
)

export default ProfilePanel
