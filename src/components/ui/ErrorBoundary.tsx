import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Stops one bad record taking the whole system down.
 *
 * A single traveller imported without an emergency contact used to throw while
 * rendering, and because nothing caught it React unmounted the entire tree —
 * the screen simply went white, with no sidebar, no message and no way back
 * except reloading. That is the worst possible failure for someone at a desk
 * in the middle of a booking.
 *
 * Now the failure is contained to the screen that caused it: the navigation
 * stays, the reason is written in plain language, and one button gets the
 * person working again.
 */
interface Props {
  children: React.ReactNode;
  /** Shown so the person knows which screen failed. */
  label?: string;
  /** Changing this value clears the error — used to reset on navigation. */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(previous: Props) {
    if (this.state.error && previous.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Keeps the detail available to whoever is looking at the console,
    // without ever putting a stack trace in front of the user.
    console.error('Screen failed to render', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-8">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h3 className="font-display text-lg font-bold text-amber-950">
              This screen could not be shown
            </h3>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-amber-900">
              Something in {this.props.label ? `the ${this.props.label} screen` : 'this screen'} could not be
              displayed — usually one record that is missing a detail the screen expects, often after an
              import. <span className="font-semibold">Nothing has been lost.</span> Everything else still
              works: use the menu on the left to carry on, or try again below.
            </p>
            <p className="mt-3 font-mono text-xs text-amber-700">{this.state.error.message}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                onClick={() => this.setState({ error: null })}
                className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white hover:bg-amber-700"
              >
                <RefreshCw className="h-4 w-4" /> Try this screen again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex min-h-11 cursor-pointer items-center rounded-xl border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 hover:bg-amber-100"
              >
                Reload the app
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
