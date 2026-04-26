import React, { useState, forwardRef, useImperativeHandle } from 'react'
import Popup from './Popup'

const EditPopup = forwardRef((props, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const [config, setConfig] = useState({ title: '', fields: [], onSave: null })
    const [values, setValues] = useState({})

    const open = ({ title, fields, onSave }) => {
        const initial = {}
        fields.forEach(f => { initial[f.key] = f.initial })
        setValues(initial)
        setConfig({ title, fields, onSave })
        setIsOpen(true)
    }

    const close = () => setIsOpen(false)

    const handleSave = async () => {
        await config.onSave(values)
        close()
    }

    useImperativeHandle(ref, () => ({ open }))

    return (
        <Popup isOpen={isOpen} onClose={close} title={config.title}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {config.fields.map(field => (
                    <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontWeight: '500', fontSize: '0.9em' }}>{field.label}</label>
                        {field.type === 'textarea' ? (
                            <textarea
                                value={values[field.key] ?? ''}
                                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                rows={4}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc', resize: 'vertical' }}
                            />
                        ) : field.type === 'select' ? (
                            <select
                                value={values[field.key] ?? ''}
                                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                            >
                                {field.options.map(opt => (
                                    <option key={opt} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>
                                ))}
                            </select>
                        ) : (
                            <input
                                type="text"
                                value={values[field.key] ?? ''}
                                onChange={e => setValues(v => ({ ...v, [field.key]: e.target.value }))}
                                style={{ padding: '8px', borderRadius: '6px', border: '1px solid #ccc' }}
                            />
                        )}
                    </div>
                ))}
            </div>
            <div className="popup-actions">
                <button className="popup-btn-cancel" onClick={close}>Cancel</button>
                <button className="popup-btn-confirm" onClick={handleSave}>Save</button>
            </div>
        </Popup>
    )
})

export default EditPopup
