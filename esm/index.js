var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import debounce from 'lodash/debounce';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Quill from 'quill';
import { addField } from 'ra-core';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
function uploadFile(file) {
    var url = "http://api.staging.fruitslive.jp/upload/s3";
    var headers = new Headers({
        "Access-Control-Allow-Origin": "*",
    });
    var TOKEN = localStorage.getItem("token");
    if (TOKEN && TOKEN !== "undefined") {
        headers.append("Authorization", "Bearer " + TOKEN);
    }
    var body = new FormData();
    body.append("FILE", file);
    try {
        return fetch(new Request(url, {
            method: "POST",
            body: body,
            headers: headers,
        }))
            .then(function (data) { return data.json(); });
    }
    catch (e) {
        throw new Error(e);
    }
}
;
function imageUpload() {
    var _this3 = this;
    var fileInput = this.container.querySelector('input.ql-image[type=file]');
    if (fileInput == null) {
        fileInput = document.createElement('input');
        fileInput.setAttribute('type', 'file');
        fileInput.setAttribute('accept', 'image/png, image/gif, image/jpeg, image/bmp, image/x-icon');
        fileInput.classList.add('ql-image');
        fileInput.addEventListener('change', function () {
            var files = fileInput.files;
            var range = _this3.quill.getSelection(true);
            if (!files || !files.length) {
                console.log('No files selected');
                return;
            }
            _this3.quill.enable(false);
            return uploadFile(files[0])
                .then(function (response) {
                _this3.quill.enable(true);
                _this3.quill.insertEmbed(range.index, 'image', "http://fruitslive-staging.s3-ap-northeast-1.amazonaws.com/" + response[0].objectName);
                _this3.quill.setSelection(range.index + 1, Quill.sources.SILENT);
                fileInput.value = '';
            });
        });
        this.container.appendChild(fileInput);
    }
    fileInput.click();
}
var RichTextInput = /** @class */ (function (_super) {
    __extends(RichTextInput, _super);
    function RichTextInput() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.lastValueChange = null;
        _this.onTextChange = debounce(function () {
            var value = _this.editor.innerHTML === '<p><br></p>'
                ? ''
                : _this.editor.innerHTML;
            _this.lastValueChange = value;
            _this.props.input.onChange(value);
        }, 500);
        _this.updateDivRef = function (ref) {
            _this.divRef = ref;
        };
        return _this;
    }
    RichTextInput.prototype.componentDidMount = function () {
        var _a = this.props, value = _a.input.value, toolbar = _a.toolbar, options = _a.options;
        this.quill = new Quill(this.divRef, __assign({ modules: {
                toolbar: {
                    container: toolbar,
                    handlers: {
                        image: imageUpload
                    }
                },
                clipboard: { matchVisual: false }
            }, theme: 'snow' }, options));
        this.quill.setContents(this.quill.clipboard.convert(value));
        this.editor = this.divRef.querySelector('.ql-editor');
        this.quill.on('text-change', this.onTextChange);
    };
    RichTextInput.prototype.componentDidUpdate = function () {
        if (this.lastValueChange !== this.props.input.value) {
            var selection = this.quill.getSelection();
            this.quill.setContents(this.quill.clipboard.convert(this.props.input.value));
            if (selection && this.quill.hasFocus()) {
                this.quill.setSelection(selection);
            }
        }
    };
    RichTextInput.prototype.componentWillUnmount = function () {
        this.quill.off('text-change', this.onTextChange);
        this.onTextChange.cancel();
        this.quill = null;
    };
    RichTextInput.prototype.render = function () {
        var _a = this.props.meta, touched = _a.touched, error = _a.error, _b = _a.helperText, helperText = _b === void 0 ? false : _b;
        return (React.createElement(FormControl, { error: !!(touched && error), fullWidth: this.props.fullWidth, className: "ra-rich-text-input" },
            React.createElement("div", { "data-testid": "quill", ref: this.updateDivRef }),
            touched && error && (React.createElement(FormHelperText, { error: true, className: "ra-rich-text-input-error" }, error)),
            helperText && React.createElement(FormHelperText, null, helperText)));
    };
    RichTextInput.propTypes = {
        addLabel: PropTypes.bool.isRequired,
        classes: PropTypes.object,
        input: PropTypes.object,
        label: PropTypes.string,
        meta: PropTypes.object,
        options: PropTypes.object,
        source: PropTypes.string,
        toolbar: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.bool,
            PropTypes.shape({
                container: PropTypes.array,
                handlers: PropTypes.object,
            }),
        ]),
        fullWidth: PropTypes.bool,
    };
    RichTextInput.defaultProps = {
        addLabel: true,
        options: {},
        record: {},
        toolbar: true,
        fullWidth: true,
    };
    return RichTextInput;
}(Component));
export { RichTextInput };
var RichTextInputWithField = addField(withStyles(styles)(RichTextInput));
RichTextInputWithField.defaultProps = {
    addLabel: true,
    fullWidth: true,
};
export default RichTextInputWithField;
