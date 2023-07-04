var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function select_option(select, value, mounting) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        if (!mounting || value !== undefined) {
            select.selectedIndex = -1; // no option should be selected
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked');
        return selected_option && selected_option.__value;
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately after the component has been updated.
     *
     * The first time the callback runs will be after the initial `onMount`
     */
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* CurrencyValuation.svelte generated by Svelte v3.59.2 */
    const file = "CurrencyValuation.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    // (56:4) {#each countries as country}
    function create_each_block_1(ctx) {
    	let option;
    	let t_value = /*country*/ ctx[12].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*country*/ ctx[12];
    			option.value = option.__value;
    			add_location(option, file, 56, 6, 1846);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*countries*/ 4 && t_value !== (t_value = /*country*/ ctx[12].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*countries*/ 4 && option_value_value !== (option_value_value = /*country*/ ctx[12])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(56:4) {#each countries as country}",
    		ctx
    	});

    	return block;
    }

    // (61:4) {#each countries as country}
    function create_each_block(ctx) {
    	let option;
    	let t_value = /*country*/ ctx[12].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*country*/ ctx[12];
    			option.value = option.__value;
    			add_location(option, file, 61, 6, 2053);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*countries*/ 4 && t_value !== (t_value = /*country*/ ctx[12].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*countries*/ 4 && option_value_value !== (option_value_value = /*country*/ ctx[12])) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(61:4) {#each countries as country}",
    		ctx
    	});

    	return block;
    }

    // (66:2) {#if valuation}
    function create_if_block(ctx) {
    	let previous_key = (/*selectedCountry1*/ ctx[0], /*selectedCountry2*/ ctx[1]);
    	let key_block_anchor;
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*selectedCountry1, selectedCountry2*/ 3 && safe_not_equal(previous_key, previous_key = (/*selectedCountry1*/ ctx[0], /*selectedCountry2*/ ctx[1]))) {
    				key_block.d(1);
    				key_block = create_key_block(ctx);
    				key_block.c();
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(66:2) {#if valuation}",
    		ctx
    	});

    	return block;
    }

    // (67:4) {#key selectedCountry1, selectedCountry2}
    function create_key_block(ctx) {
    	let div0;
    	let p0;
    	let t0;
    	let t1;
    	let br0;
    	let t2;
    	let span0;
    	let t3_value = formatNumber(/*exchangeRate*/ ctx[3]) + "";
    	let t3;
    	let t4;
    	let span1;
    	let t5_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry2*/ ctx[1].code] / /*bigMacPrices*/ ctx[6][/*selectedCountry1*/ ctx[0].code]) + "";
    	let t5;
    	let t6;
    	let br1;
    	let t7;
    	let t8_value = /*selectedCountry1*/ ctx[0].name + "";
    	let t8;
    	let t9;
    	let span2;
    	let t10_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry1*/ ctx[0].code]) + "";
    	let t10;
    	let t11;
    	let t12_value = /*selectedCountry1*/ ctx[0].code + "";
    	let t12;
    	let t13;
    	let span3;
    	let t14_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry2*/ ctx[1].code] / /*exchangeRate*/ ctx[3]) + "";
    	let t14;
    	let t15;
    	let t16_value = /*selectedCountry1*/ ctx[0].code + "";
    	let t16;
    	let t17;
    	let t18_value = /*selectedCountry2*/ ctx[1].name + "";
    	let t18;
    	let t19;
    	let div4;
    	let div3;
    	let div1;
    	let img0;
    	let img0_src_value;
    	let t20;
    	let p1;
    	let span4;
    	let span4_class_value;
    	let t21;
    	let t22_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry1*/ ctx[0].code]) + "";
    	let t22;
    	let t23;
    	let t24_value = /*selectedCountry1*/ ctx[0].code + "";
    	let t24;
    	let t25;
    	let div2;
    	let img1;
    	let img1_src_value;
    	let t26;
    	let p2;
    	let span5;
    	let span5_class_value;
    	let t27;
    	let t28_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry2*/ ctx[1].code] / /*exchangeRate*/ ctx[3]) + "";
    	let t28;
    	let t29;
    	let t30_value = /*selectedCountry1*/ ctx[0].code + "";
    	let t30;
    	let div4_class_value;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			p0 = element("p");
    			t0 = text(/*valuation*/ ctx[4]);
    			t1 = space();
    			br0 = element("br");
    			t2 = text("\n      Exchange Rate: ");
    			span0 = element("span");
    			t3 = text(t3_value);
    			t4 = text(" Implied Exchange Rate: ");
    			span1 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			br1 = element("br");
    			t7 = text("\n      A Big Mac bought in ");
    			t8 = text(t8_value);
    			t9 = text(" for ");
    			span2 = element("span");
    			t10 = text(t10_value);
    			t11 = space();
    			t12 = text(t12_value);
    			t13 = text("\n          would be valued at ");
    			span3 = element("span");
    			t14 = text(t14_value);
    			t15 = space();
    			t16 = text(t16_value);
    			t17 = text(" in ");
    			t18 = text(t18_value);
    			t19 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			img0 = element("img");
    			t20 = space();
    			p1 = element("p");
    			span4 = element("span");
    			t21 = space();
    			t22 = text(t22_value);
    			t23 = space();
    			t24 = text(t24_value);
    			t25 = space();
    			div2 = element("div");
    			img1 = element("img");
    			t26 = space();
    			p2 = element("p");
    			span5 = element("span");
    			t27 = space();
    			t28 = text(t28_value);
    			t29 = space();
    			t30 = text(t30_value);
    			add_location(br0, file, 69, 6, 2271);
    			attr_dev(span0, "class", "bold-number svelte-1fuqwd4");
    			add_location(span0, file, 70, 21, 2297);
    			attr_dev(span1, "class", "bold-number svelte-1fuqwd4");
    			add_location(span1, file, 70, 106, 2382);
    			add_location(br1, file, 71, 6, 2511);
    			attr_dev(span2, "class", "bold-number svelte-1fuqwd4");
    			add_location(span2, file, 72, 54, 2570);
    			attr_dev(span3, "class", "bold-number svelte-1fuqwd4");
    			add_location(span3, file, 73, 29, 2709);
    			attr_dev(p0, "class", "valuation svelte-1fuqwd4");
    			add_location(p0, file, 68, 6, 2231);
    			attr_dev(div0, "class", "result-container");
    			add_location(div0, file, 67, 4, 2194);
    			attr_dev(img0, "class", "big-mac-image svelte-1fuqwd4");
    			if (!src_url_equal(img0.src, img0_src_value = "https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "Big Mac");
    			add_location(img0, file, 80, 10, 3019);
    			attr_dev(span4, "class", span4_class_value = "flag-icon flag-icon-" + /*selectedCountry1*/ ctx[0].code.toLowerCase() + " svelte-1fuqwd4");
    			add_location(span4, file, 82, 12, 3227);
    			attr_dev(p1, "class", "label svelte-1fuqwd4");
    			add_location(p1, file, 81, 10, 3197);
    			attr_dev(div1, "class", "svelte-1fuqwd4");
    			add_location(div1, file, 79, 8, 3003);
    			attr_dev(img1, "class", "big-mac-image svelte-1fuqwd4");
    			if (!src_url_equal(img1.src, img1_src_value = "https://s7d1.scene7.com/is/image/mcdonalds/DC_201907_0005_BigMac_832x472:product-header-desktop?wid=830&hei=458&dpr=off")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "Big Mac");
    			add_location(img1, file, 87, 10, 3457);
    			attr_dev(span5, "class", span5_class_value = "flag-icon flag-icon-" + /*selectedCountry2*/ ctx[1].code.toLowerCase() + " svelte-1fuqwd4");
    			add_location(span5, file, 89, 12, 3665);
    			attr_dev(p2, "class", "label svelte-1fuqwd4");
    			add_location(p2, file, 88, 10, 3635);
    			attr_dev(div2, "class", "svelte-1fuqwd4");
    			add_location(div2, file, 86, 8, 3441);
    			attr_dev(div3, "class", "image-container svelte-1fuqwd4");
    			add_location(div3, file, 78, 6, 2965);
    			attr_dev(div4, "class", div4_class_value = "big-mac-container " + (/*showBigMacContainer*/ ctx[5] ? 'show' : '') + " svelte-1fuqwd4");
    			add_location(div4, file, 76, 4, 2886);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(p0, br0);
    			append_dev(p0, t2);
    			append_dev(p0, span0);
    			append_dev(span0, t3);
    			append_dev(p0, t4);
    			append_dev(p0, span1);
    			append_dev(span1, t5);
    			append_dev(p0, t6);
    			append_dev(p0, br1);
    			append_dev(p0, t7);
    			append_dev(p0, t8);
    			append_dev(p0, t9);
    			append_dev(p0, span2);
    			append_dev(span2, t10);
    			append_dev(span2, t11);
    			append_dev(span2, t12);
    			append_dev(p0, t13);
    			append_dev(p0, span3);
    			append_dev(span3, t14);
    			append_dev(span3, t15);
    			append_dev(span3, t16);
    			append_dev(p0, t17);
    			append_dev(p0, t18);
    			insert_dev(target, t19, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, img0);
    			append_dev(div1, t20);
    			append_dev(div1, p1);
    			append_dev(p1, span4);
    			append_dev(p1, t21);
    			append_dev(p1, t22);
    			append_dev(p1, t23);
    			append_dev(p1, t24);
    			append_dev(div3, t25);
    			append_dev(div3, div2);
    			append_dev(div2, img1);
    			append_dev(div2, t26);
    			append_dev(div2, p2);
    			append_dev(p2, span5);
    			append_dev(p2, t27);
    			append_dev(p2, t28);
    			append_dev(p2, t29);
    			append_dev(p2, t30);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*valuation*/ 16) set_data_dev(t0, /*valuation*/ ctx[4]);
    			if (dirty & /*exchangeRate*/ 8 && t3_value !== (t3_value = formatNumber(/*exchangeRate*/ ctx[3]) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*selectedCountry2, selectedCountry1*/ 3 && t5_value !== (t5_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry2*/ ctx[1].code] / /*bigMacPrices*/ ctx[6][/*selectedCountry1*/ ctx[0].code]) + "")) set_data_dev(t5, t5_value);
    			if (dirty & /*selectedCountry1*/ 1 && t8_value !== (t8_value = /*selectedCountry1*/ ctx[0].name + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*selectedCountry1*/ 1 && t10_value !== (t10_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry1*/ ctx[0].code]) + "")) set_data_dev(t10, t10_value);
    			if (dirty & /*selectedCountry1*/ 1 && t12_value !== (t12_value = /*selectedCountry1*/ ctx[0].code + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*selectedCountry2, exchangeRate*/ 10 && t14_value !== (t14_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry2*/ ctx[1].code] / /*exchangeRate*/ ctx[3]) + "")) set_data_dev(t14, t14_value);
    			if (dirty & /*selectedCountry1*/ 1 && t16_value !== (t16_value = /*selectedCountry1*/ ctx[0].code + "")) set_data_dev(t16, t16_value);
    			if (dirty & /*selectedCountry2*/ 2 && t18_value !== (t18_value = /*selectedCountry2*/ ctx[1].name + "")) set_data_dev(t18, t18_value);

    			if (dirty & /*selectedCountry1, countries*/ 5 && span4_class_value !== (span4_class_value = "flag-icon flag-icon-" + /*selectedCountry1*/ ctx[0].code.toLowerCase() + " svelte-1fuqwd4")) {
    				attr_dev(span4, "class", span4_class_value);
    			}

    			if (dirty & /*selectedCountry1*/ 1 && t22_value !== (t22_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry1*/ ctx[0].code]) + "")) set_data_dev(t22, t22_value);
    			if (dirty & /*selectedCountry1*/ 1 && t24_value !== (t24_value = /*selectedCountry1*/ ctx[0].code + "")) set_data_dev(t24, t24_value);

    			if (dirty & /*selectedCountry2, countries*/ 6 && span5_class_value !== (span5_class_value = "flag-icon flag-icon-" + /*selectedCountry2*/ ctx[1].code.toLowerCase() + " svelte-1fuqwd4")) {
    				attr_dev(span5, "class", span5_class_value);
    			}

    			if (dirty & /*selectedCountry2, exchangeRate*/ 10 && t28_value !== (t28_value = formatNumber(/*bigMacPrices*/ ctx[6][/*selectedCountry2*/ ctx[1].code] / /*exchangeRate*/ ctx[3]) + "")) set_data_dev(t28, t28_value);
    			if (dirty & /*selectedCountry1*/ 1 && t30_value !== (t30_value = /*selectedCountry1*/ ctx[0].code + "")) set_data_dev(t30, t30_value);

    			if (dirty & /*showBigMacContainer*/ 32 && div4_class_value !== (div4_class_value = "big-mac-container " + (/*showBigMacContainer*/ ctx[5] ? 'show' : '') + " svelte-1fuqwd4")) {
    				attr_dev(div4, "class", div4_class_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t19);
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(67:4) {#key selectedCountry1, selectedCountry2}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let h10;
    	let t1;
    	let h11;
    	let t2;
    	let span;
    	let t4;
    	let t5;
    	let select0;
    	let t6;
    	let select1;
    	let t7;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*countries*/ ctx[2];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*countries*/ ctx[2];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	let if_block = /*valuation*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h10 = element("h1");
    			h10.textContent = "Big Mac Index";
    			t1 = space();
    			h11 = element("h1");
    			t2 = text("How valuable is ");
    			span = element("span");
    			span.textContent = "your";
    			t4 = text(" currency?");
    			t5 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t6 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t7 = space();
    			if (if_block) if_block.c();
    			attr_dev(h10, "class", "svelte-1fuqwd4");
    			add_location(h10, file, 51, 2, 1606);
    			attr_dev(span, "class", "different-color svelte-1fuqwd4");
    			add_location(span, file, 52, 22, 1651);
    			attr_dev(h11, "class", "svelte-1fuqwd4");
    			add_location(h11, file, 52, 2, 1631);
    			attr_dev(select0, "id", "country1-dropdown");
    			attr_dev(select0, "class", "svelte-1fuqwd4");
    			if (/*selectedCountry1*/ ctx[0] === void 0) add_render_callback(() => /*select0_change_handler*/ ctx[8].call(select0));
    			add_location(select0, file, 54, 2, 1713);
    			attr_dev(select1, "id", "country2-dropdown");
    			attr_dev(select1, "class", "svelte-1fuqwd4");
    			if (/*selectedCountry2*/ ctx[1] === void 0) add_render_callback(() => /*select1_change_handler*/ ctx[9].call(select1));
    			add_location(select1, file, 59, 2, 1920);
    			attr_dev(main, "class", "svelte-1fuqwd4");
    			add_location(main, file, 50, 0, 1597);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h10);
    			append_dev(main, t1);
    			append_dev(main, h11);
    			append_dev(h11, t2);
    			append_dev(h11, span);
    			append_dev(h11, t4);
    			append_dev(main, t5);
    			append_dev(main, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(select0, null);
    				}
    			}

    			select_option(select0, /*selectedCountry1*/ ctx[0], true);
    			append_dev(main, t6);
    			append_dev(main, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select1, null);
    				}
    			}

    			select_option(select1, /*selectedCountry2*/ ctx[1], true);
    			append_dev(main, t7);
    			if (if_block) if_block.m(main, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(select0, "change", /*select0_change_handler*/ ctx[8]),
    					listen_dev(select0, "change", /*handleCountryChange*/ ctx[7], false, false, false, false),
    					listen_dev(select1, "change", /*select1_change_handler*/ ctx[9]),
    					listen_dev(select1, "change", /*handleCountryChange*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*countries*/ 4) {
    				each_value_1 = /*countries*/ ctx[2];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(select0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*selectedCountry1, countries*/ 5) {
    				select_option(select0, /*selectedCountry1*/ ctx[0]);
    			}

    			if (dirty & /*countries*/ 4) {
    				each_value = /*countries*/ ctx[2];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(select1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*selectedCountry2, countries*/ 6) {
    				select_option(select1, /*selectedCountry2*/ ctx[1]);
    			}

    			if (/*valuation*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(main, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function formatNumber(value) {
    	return Number(value).toFixed(2);
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('CurrencyValuation', slots, []);
    	let { countries } = $$props;
    	let { selectedCountry1 } = $$props;
    	let { selectedCountry2 } = $$props;
    	let exchangeRate;
    	let valuation;

    	const bigMacPrices = {
    		"CAD": 6.77,
    		"CNY": 24,
    		"INR": 191,
    		"USD": 5.15,
    		"EUR": 4.65,
    		"CHF": 6.5
    	}; // hardcoded

    	let showBigMacContainer = false;

    	async function fetchExchangeRate(foreignCountry) {
    		const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${selectedCountry1.code}`);
    		const data = await response.json();
    		return data.rates[foreignCountry];
    	}

    	function calculateValuation() {
    		const price1 = bigMacPrices[selectedCountry1.code];
    		const price2 = bigMacPrices[selectedCountry2.code];
    		const impliedExchangeRate = price2 / price1;

    		if (impliedExchangeRate > exchangeRate) {
    			return `${selectedCountry2.code} is overvalued relative to ${selectedCountry1.code}`;
    		} else if (impliedExchangeRate < exchangeRate) {
    			return `${selectedCountry2.code} is undervalued relative to ${selectedCountry1.code}`;
    		} else {
    			return `${selectedCountry2.code} is fairly valued relative to ${selectedCountry1.code}`;
    		}
    	}

    	async function handleCountryChange() {
    		$$invalidate(3, exchangeRate = await fetchExchangeRate(selectedCountry2.code));
    		$$invalidate(4, valuation = calculateValuation());
    		$$invalidate(5, showBigMacContainer = true);
    	}

    	onMount(async () => {
    		await handleCountryChange();
    		$$invalidate(4, valuation = calculateValuation());
    	});

    	$$self.$$.on_mount.push(function () {
    		if (countries === undefined && !('countries' in $$props || $$self.$$.bound[$$self.$$.props['countries']])) {
    			console.warn("<CurrencyValuation> was created without expected prop 'countries'");
    		}

    		if (selectedCountry1 === undefined && !('selectedCountry1' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry1']])) {
    			console.warn("<CurrencyValuation> was created without expected prop 'selectedCountry1'");
    		}

    		if (selectedCountry2 === undefined && !('selectedCountry2' in $$props || $$self.$$.bound[$$self.$$.props['selectedCountry2']])) {
    			console.warn("<CurrencyValuation> was created without expected prop 'selectedCountry2'");
    		}
    	});

    	const writable_props = ['countries', 'selectedCountry1', 'selectedCountry2'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<CurrencyValuation> was created with unknown prop '${key}'`);
    	});

    	function select0_change_handler() {
    		selectedCountry1 = select_value(this);
    		$$invalidate(0, selectedCountry1);
    		$$invalidate(2, countries);
    	}

    	function select1_change_handler() {
    		selectedCountry2 = select_value(this);
    		$$invalidate(1, selectedCountry2);
    		$$invalidate(2, countries);
    	}

    	$$self.$$set = $$props => {
    		if ('countries' in $$props) $$invalidate(2, countries = $$props.countries);
    		if ('selectedCountry1' in $$props) $$invalidate(0, selectedCountry1 = $$props.selectedCountry1);
    		if ('selectedCountry2' in $$props) $$invalidate(1, selectedCountry2 = $$props.selectedCountry2);
    	};

    	$$self.$capture_state = () => ({
    		afterUpdate,
    		onMount,
    		countries,
    		selectedCountry1,
    		selectedCountry2,
    		exchangeRate,
    		valuation,
    		bigMacPrices,
    		showBigMacContainer,
    		fetchExchangeRate,
    		calculateValuation,
    		handleCountryChange,
    		formatNumber
    	});

    	$$self.$inject_state = $$props => {
    		if ('countries' in $$props) $$invalidate(2, countries = $$props.countries);
    		if ('selectedCountry1' in $$props) $$invalidate(0, selectedCountry1 = $$props.selectedCountry1);
    		if ('selectedCountry2' in $$props) $$invalidate(1, selectedCountry2 = $$props.selectedCountry2);
    		if ('exchangeRate' in $$props) $$invalidate(3, exchangeRate = $$props.exchangeRate);
    		if ('valuation' in $$props) $$invalidate(4, valuation = $$props.valuation);
    		if ('showBigMacContainer' in $$props) $$invalidate(5, showBigMacContainer = $$props.showBigMacContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		selectedCountry1,
    		selectedCountry2,
    		countries,
    		exchangeRate,
    		valuation,
    		showBigMacContainer,
    		bigMacPrices,
    		handleCountryChange,
    		select0_change_handler,
    		select1_change_handler
    	];
    }

    class CurrencyValuation extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			countries: 2,
    			selectedCountry1: 0,
    			selectedCountry2: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CurrencyValuation",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get countries() {
    		throw new Error("<CurrencyValuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set countries(value) {
    		throw new Error("<CurrencyValuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedCountry1() {
    		throw new Error("<CurrencyValuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedCountry1(value) {
    		throw new Error("<CurrencyValuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get selectedCountry2() {
    		throw new Error("<CurrencyValuation>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set selectedCountry2(value) {
    		throw new Error("<CurrencyValuation>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* App.svelte generated by Svelte v3.59.2 */

    function create_fragment$1(ctx) {
    	let currencyvaluation;
    	let current;

    	currencyvaluation = new CurrencyValuation({
    			props: {
    				countries: /*countries*/ ctx[0],
    				selectedCountry1: undefined,
    				selectedCountry2: undefined
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(currencyvaluation.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(currencyvaluation, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(currencyvaluation.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(currencyvaluation.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(currencyvaluation, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const countries = [
    		{ name: "United States", code: "USD" },
    		{ name: "Eurozone", code: "EUR" },
    		{ name: "India", code: "INR" },
    		{ name: "China", code: "CNY" },
    		{ name: "Canada", code: "CAD" },
    		{ name: "Switzerland", code: "CHF" }
    	];

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ CurrencyValuation, countries });
    	return [countries];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
