import Select from "react-select"

const SelectInput = ({ options, onChange, name, selected, required = false }) => {
    return (
        <Select
            name={`${name}`}
            className="w-full"
            options={options}
            placeholder="Seleccione..."
            // defaultValue={selected}
            required={required}
            value={selected}
            styles={{
                control: (styles) => ({
                    ...styles,
                    border: "1px solid rgb(212 212 216/1)",
                    borderRadius: "0.5rem",
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    outline: "none",
                    ":hover": {
                        borderColor: "rgb(161 161 170/1)"
                    }
                }),
                option: (styles, { isSelected }) => ({
                    ...styles,
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                    color: "rgb(55 65 81 / 1)",
                    backgroundColor: isSelected ? "rgb(229 231 235 / 1)" : undefined,
                    ":hover": {
                        backgroundColor: "rgb(229 231 235 / 1)"
                    },
                    ":active": {
                        ...styles[":active"],
                        backgroundColor: isSelected ? "rgb(229 231 235 / 1)" : undefined
                    }

                }),
                input: (styles) => ({
                    ...styles,
                    fontSize: "0.875rem",
                    lineHeight: "1.25rem",
                }),
                menu: (styles) => ({
                    ...styles,
                    marginTop: ".2rem",
                    width: "260px",
                }),
            }}
            onChange={onChange}
        />
    )
}

export default SelectInput